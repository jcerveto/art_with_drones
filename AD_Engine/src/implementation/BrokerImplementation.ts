import {Kafka, Producer} from 'kafkajs';
import {MapEntity} from "../model/MapEntity";
import {DronEntity} from "../model/DronEntity";
import * as BrokerSettings from "../settings/BrokerSettings";
import {SquareEntity} from "../model/SquareEntity";
import {ServerEntity} from "../model/ServerEntity";
import {EStatus} from "../model/EStatus";
import {EKeepAliveStatus} from "../model/EKeepAliveStatus";


const kafka = new Kafka({
    clientId: "art_with_drones",
    brokers: [`${BrokerSettings.BROKER_HOST}:${BrokerSettings.BROKER_PORT}`]
});

// ************************************************
// variable global
// ************************************************
// MAP PUBLISHER
const producerMap: Producer = kafka.producer();

export async function initMapPublisher() {
    await producerMap.connect();
}

export async function publishMap(map: MapEntity) {
    try {
        const mapJson = map.toJson();
        const objectToSend = {
            map: mapJson
        }
        await producerMap.send({
            topic: BrokerSettings.TOPIC_MAP,
            messages: [
                {value: JSON.stringify(objectToSend)}
            ]
        });
        console.log(map.toString());
    } catch (err) {
        console.error("ERROR: Trying to publish the map. ")
    }
}

export async function subscribeToCurrentPosition(server: ServerEntity, drone: DronEntity) {
    const droneId = drone.getId();
    const droneTopic = `${BrokerSettings.TOPIC_CURRENT_POSITION}_${droneId}`;
    const droneGroupId = `current_position=${droneId}`;

    const consumer = kafka.consumer({
        groupId: droneGroupId
    });

    await consumer.connect();
    await consumer.subscribe({
        topic: droneTopic,
        fromBeginning: false
    })
    console.log(`Subscribed to topic ${droneTopic} with groupId ${droneGroupId}`);

    await consumer.run({
        eachMessage: async ({
            topic,
            partition,
            message
        }) => {
            // handle new position
            const value = JSON.parse(message.value.toString());
            const drones = server.getMap().getAliveDrones();
            console.log("drones: " + JSON.stringify(drones))
            console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++")
            console.log(`Received message ${JSON.stringify(value)} on topic ${topic}, grupo: ${droneGroupId} partition ${partition}`);
            const currentSquareEntity = new SquareEntity(value?.row, value?.col);
            console.log("Current square: ", currentSquareEntity.toString())
            const idReceived: number = parseInt(value?.id_registry)
            const droneEntity = new DronEntity(idReceived);
            console.log("drone: ", droneEntity.toString());
            console.log(`New current position received: ${droneEntity.toString()}, ${currentSquareEntity.getHash()}`)
            server.getMap().moveDrone(droneEntity, currentSquareEntity);
            await publishMap(server.getMap());
        }
    })

}

export async function publishTargetPosition(drone: DronEntity, targetPosition: SquareEntity): Promise<void> {
    // TARGET POSITION PUBLISHER
    const producerTargetPosition: Producer = kafka.producer();

    const droneId = drone.getId();
    const topicTargetPositionCurrent: string = `${BrokerSettings.TOPIC_TARGET_POSITION}_${droneId}`;
    const positionJson = targetPosition.toJson();
    try {
        await producerTargetPosition.connect();
        const objectToSend = {
            id_registry: droneId,
            target_position: positionJson
        };
        await producerTargetPosition.send({
            topic: topicTargetPositionCurrent,
            messages: [
                {value: JSON.stringify(objectToSend)}
            ]
        });
    } catch (err) {
        console.error(`ERROR: Trying to publish the target position. ${err}. DroneId: ${droneId}`);
    }
}

export async function handleKeepAliveStatus(server: ServerEntity, newDrone: DronEntity): Promise<NodeJS.Timeout> {
    try {
        const droneId = newDrone.getId();
        const droneTopic = `${BrokerSettings.TOPIC_KEEP_ALIVE}_${droneId}`;
        const droneGroupId = `keep_alive_dron_id_${droneId}`;

        const keepAliveConsumer = kafka.consumer({
            groupId: droneGroupId,
        });


        await keepAliveConsumer.connect();
        await keepAliveConsumer.subscribe({
            topic: droneTopic,
            fromBeginning: false
        });

        let messageReceived = false;


        const onMessageReceivedCallback = async () => {
            console.log('Se recibió un mensaje en el topic "keep_alive". Ejecutando el callback de condición cumplida...');
            if (server.getMap().isDroneInMap(newDrone)) {
                server.getMap().changeDroneStatus(newDrone, EKeepAliveStatus.ALIVE);
                console.log(`dronId: ${droneId} now is ALIVE`);
            } else {
                console.error(`ERROR: Drone ${droneId} is not in map.`);
            }

            await server.sendMapToDrones();
        }

        const onNoMessageReceivedCallback = async () => {
            console.log('No se recibió ningún mensaje en el topic "keep_alive". Ejecutando el callback de condición no cumplida...');
            if (server.getMap().isDroneInMap(newDrone)) {
                server.getMap().changeDroneStatus(newDrone, EKeepAliveStatus.DEAD);
                console.log(`dronId: ${droneId} now is UNKNOWN`);
            } else {
                console.error(`ERROR: Drone ${droneId} not in map.`)
            }

            await server.sendMapToDrones();
        }

        // poner un await y crear una promesa con timeout encapsulando el consumer.run
        keepAliveConsumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                messageReceived = true;
                await onMessageReceivedCallback(); // Ejecuta el callback cuando se recibe un mensaje
            },
        });

        const setIntervalId: NodeJS.Timeout = setInterval(async () => {
            if (!messageReceived) {
                console.log('No se recibió ningún mensaje en el topic "keep_alive". Ejecutando el callback de condición no cumplida...');
                await onNoMessageReceivedCallback(); // Ejecuta el callback cuando no se recibe ningún mensaje
            }

            messageReceived = false; // Reinicia el estado del mensaje recibido para la próxima comprobación

        }, BrokerSettings.KEEP_ALIVE_INTERVAL);

        return setIntervalId;
    } catch (err) {
        console.error("ERROR: Trying to handleKeepAliveStatus. Exception was not raised. ", err.message);
    }
}


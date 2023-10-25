import {Kafka, Producer} from 'kafkajs';
import {MapEntity} from "../model/MapEntity";
import {DronEntity} from "../model/DronEntity";
import * as BrokerSettings from "../settings/BrokerSettings";
import {SquareEntity} from "../model/SquareEntity";
import {ServerEntity} from "../model/ServerEntity";
import {EStatus} from "../model/EStatus";
import {EKeepAliveStatus} from "../model/EKeepAliveStatus";
import { sleep } from './TimeUtils';


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
    console.log("Map publisher connected");
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
        console.log("drones: " , map.getAllDrones().length, "alive: ", map.getAliveDrones().length, "dead: ", map.getDeadDrones().length);
    } catch (err) {
        console.error("ERROR: Trying to publish the map. ")
    }
}

export async function subscribeToCurrentPosition(server: ServerEntity) {
    const currentPositionTopic = BrokerSettings.TOPIC_CURRENT_POSITION;
    const engineGroupId = `current_position_ad_engine`;

    const consumer = kafka.consumer({
        groupId: engineGroupId,
    });

    await consumer.connect();
    await consumer.subscribe({
        topic: currentPositionTopic,
        fromBeginning: false
    })
    console.log(`Subscribed to topic ${currentPositionTopic} with groupId ${engineGroupId}`);

    await consumer.run({
        eachMessage: async ({
            topic,
            partition,
            message
        }) => {
            // handle new position
            const value = JSON.parse(message.value.toString());
            const drones = server.getMap().getAllDrones();
            console.log("drones in map: " + JSON.stringify(drones))
            console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++")
            console.log(`Received message ${JSON.stringify(value)} on topic ${topic}, grupo: ${engineGroupId} partition ${partition}`);

            const droneId = parseInt(value?.id_registry);
            const row = parseInt(value?.current_position?.row);
            const col = parseInt(value?.current_position?.col);
            
            const droneEntity = new DronEntity(droneId);
            const currentSquareEntity = new SquareEntity(row, col);

            if (! server.getMap().isDroneInMap(droneEntity)) {
                console.error("ERROR: Drone not in map. Request ignored. DroneId: ", droneId);
                return;
            }

            console.log(`New current position received: ${droneEntity.toString()}, ${currentSquareEntity.getHash()}`)
            server.getMap().moveDrone(droneEntity, currentSquareEntity);

            await publishMap(server.getMap());
            if (server.getMap().matchesWithFigure(
                server.getCurrentFigure()
            )) {
                console.log(`FIGURE ${server.getCurrentFigure().getName()} COMPLETED!`);
                console.log(`WATING 10 SECONDS TO DRAW NEXT FIGURE...`);
                await sleep(10_000);
                // SALIR DEL FLUJO DE CONSUMER.RUN AQUI
                await consumer.disconnect();
            }
        }
    })

}

export async function publishTargetPosition(drone: DronEntity, targetPosition: SquareEntity): Promise<void> {
    // TARGET POSITION PUBLISHER
    const producerTargetPosition: Producer = kafka.producer();

    const droneId = drone.getId();
    const topicTargetPosition: string = BrokerSettings.TOPIC_TARGET_POSITION;
    const positionJson = targetPosition.toJson();
    try {
        await producerTargetPosition.connect();
        const objectToSend = {
            id_registry: droneId,
            target_position: positionJson
        };
        await producerTargetPosition.send({
            topic: topicTargetPosition,
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


import {Kafka, Producer} from 'kafkajs';
import {MapEntity} from "../model/MapEntity";
import {DronEntity} from "../model/DronEntity";
import * as BrokerSettings from "../settings/BrokerSettings";
import {SquareEntity} from "../model/SquareEntity";
import {ServerEntity} from "../model/ServerEntity";
import {EStatus} from "../model/EStatus";


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

export async function subscribeToCurrentPosition(currentMap: MapEntity, drone: DronEntity) {
    const droneId = drone.getId();
    const droneTopic = `${BrokerSettings.TOPIC_CURRENT_POSITION}_${droneId}`;
    const droneGroupId = `current_position_dron_id=${droneId}`;

    const consumer = kafka.consumer({
        groupId: droneGroupId
    });

    await consumer.connect();
    await consumer.subscribe({
        topic: droneTopic,
        fromBeginning: false
    })

    await consumer.run({
        eachMessage: async ({
            topic,
            partition,
            message
        }) => {
            // handle new position
            const value = JSON.parse(message.value.toString());
            console.log(`Received message ${JSON.stringify(value)} on topic ${topic}, grupo: ${droneGroupId} partition ${partition}`);
            const square = value?.square;
            const currentSquareEntity = new SquareEntity(square?.row, square?.col);
            const droneEntity = new DronEntity(droneId);
            currentMap.moveDrone(droneEntity, currentSquareEntity);
            await publishMap(currentMap);
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

export async function suscribeToKeepAlive(server: ServerEntity , drone: DronEntity): Promise<void> {
    try {
        console.log("FALTA PROBAR ESTA FUNCION: suscribeToKeepAlive");
        const droneId = drone.getId();
        const droneTopic = `${BrokerSettings.TOPIC_KEEP_ALIVE}_${droneId}`;
        console.log("droneTopic: ", droneTopic);
        const droneGroupId = `keep_alive_dron_id=${droneId}`;

        let keepAliveReceived = false;

        const keepAliveConsumer = kafka.consumer({
            groupId: droneGroupId
        });

        await keepAliveConsumer.connect();
        await keepAliveConsumer.subscribe({
            topic: droneTopic,
            fromBeginning: false
        })

        await keepAliveConsumer.run({
            eachMessage: async ({
                                    topic,
                                    partition,
                                    message
                                }) => {
                // handle new position
                const value = JSON.parse(`Mensaje recibido en el keep alive con topic=${topic}, partition=${partition}. ` + message.value.toString());

                keepAliveReceived = true;
                setTimeout(() => {
                    console.log("Evaluating keep alive from: ", droneId);
                    // Verificar si se ha recibido un mensaje de keep alive dentro del período de tiempo
                    if (!keepAliveReceived) {
                        console.log("Keep alive not received. Changing status to UNKNOWN");
                        server.getMap().changeDroneStatus(drone, EStatus.UNKNOWN);
                    } else {
                        console.log("Keep alive received. Changing status to GOOD");
                        // Si se recibió un mensaje de keep alive, cambiar el estado a GOOD
                        server.getMap().changeDroneStatus(drone, EStatus.GOOD);
                    }
                    // Volver a enviar el mapa a los drones
                    server.sendMapToDrones();

                    // Restablecer la bandera para el próximo intervalo
                    keepAliveReceived = false;
                }, 10_000);
            }
        });
    } catch (err) {
        console.error("ERROR: Trying to suscribeToKeepAlive. Exception Re-Raised", err.message);
        throw err;
    }

}

import {Consumer, Kafka, KafkaMessage, logLevel, Producer} from 'kafkajs';
import {MapEntity} from "../model/MapEntity";
import {DronEntity} from "../model/DronEntity";
import * as BrokerSettings from "../settings/BrokerSettings";
import {SquareEntity} from "../model/SquareEntity";
import {ServerEntity} from "../model/ServerEntity";
import {EKeepAliveStatus} from "../model/EKeepAliveStatus";
import {sleep} from './TimeUtils';


const kafka = new Kafka({
    clientId: "art_with_drones",
    brokers: [`${BrokerSettings.BROKER_HOST}:${BrokerSettings.BROKER_PORT}`],
    logLevel: logLevel.NOTHING,        // Solo muestra los mensajes de ERROR
    connectionTimeout: 30_000,             // Time in milliseconds to wait for a successful connection. The default value is: 1000.
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
        if (BrokerSettings.SHOW_MAP) {
            console.log(map.toString());
        }
        console.log("drones: " , map.getAllDrones().length, "alive: ", map.getAliveDrones().length, "dead: ", map.getDeadDrones().length);
    } catch (err) {
        console.error("ERROR: Trying to publish the map. ", err.message, err.stack);
    }
}

async function handleCurrentCoordinateReceived(server: ServerEntity, consumer: Consumer, message: KafkaMessage) {
    try {
        const value = JSON.parse(message.value.toString());
        const drones = server.getMap().getAllDrones();
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++")
        console.log("drones in map: " + JSON.stringify(drones))
        console.log(`Received message ${JSON.stringify(value)}`);

        const droneId = parseInt(value?.id_registry);
        const row = parseInt(value?.current_position?.row);
        const col = parseInt(value?.current_position?.col);

        console.log("droneId: " + droneId, "row: " + row, "col: " + col);
        const droneEntity = server.getMap().getDroneBySquare(droneId);
        const currentSquareEntity = new SquareEntity(row, col);

        // Check if drone is in map
        if (! server.getMap().isDroneInMap(droneEntity)) {
            console.error("ERROR: Drone not in map. Request ignored. DroneId: ", droneId);
            return;
        }

        // check if show is going on
        if (! server.getShowActive()) {
            console.error("ERROR: Show is not active. Request ignored. DroneId: ", droneId);
            return;
        } else {
            console.log("Show is active. Figure: ", server.getCurrentFigure().getName());
        }

        // move drone
        console.log(`New current position received: ${droneEntity.toString()}, ${currentSquareEntity.getHash()}`)
        server.getMap().moveDrone(droneEntity, currentSquareEntity);

        await publishMap(server.getMap());
        console.log('----------- \n currentFigure: ', server.getCurrentFigure().getName(), '\n -----------');
        if (await server.getMap().matchesWithFigure(server.getCurrentFigure())) {
            server.deactivateShow();
            // SALIR DEL FLUJO DE CONSUMER.RUN AQUI
            await consumer.disconnect();
        }
    } catch (err) {
        console.error("ERROR: Trying to handleCurrentCoordinateReceived. Exception was not raised. Ignoring message. ", err.message);
    }
}
export async function subscribeToCurrentPosition(server: ServerEntity) {
    const currentPositionTopic = BrokerSettings.TOPIC_CURRENT_POSITION;
    const engineGroupId = `current_position_ad_engine_current_position_${Date.now()}`;

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
            try {
                await handleCurrentCoordinateReceived(server, consumer, message);
            } catch (err) {
                console.error("ERROR: Trying to handleCurrentCoordinateReceived. Re-Raising exception...", err.message);
                throw err;
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


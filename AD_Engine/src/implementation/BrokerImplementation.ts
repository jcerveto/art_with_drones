import {Kafka, Producer} from 'kafkajs';
import {MapEntity} from "../model/MapEntity";
import {DronEntity} from "../model/DronEntity";

const kafka = new Kafka({
    clientId: "map",
    brokers: ['0.0.0.0:29092']
});

// ************************************************
// variable global
// ************************************************
const producer: Producer = kafka.producer();


export async function initMapPublisher() {
    await producer.connect();
}

export async function publishMap(map: MapEntity) {
    try {
        const mapJson = map.toJson();
        const objectToSend = {
            map: mapJson
        }
        await producer.send({
            topic: "map",
            messages: [
                {value: JSON.stringify(objectToSend)}
            ]
        });
    } catch (err) {
        console.error("ERROR: Trying to publish the map. ")
    }
}

export async function subscribeToDrone(drone: DronEntity) {
    const droneId = drone.getId();
    const droneTopic = `droneId=${droneId}`;
    const droneGroupId = `droneId=${droneId}`;

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
        }
    })

}


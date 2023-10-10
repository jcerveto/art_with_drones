const { Kafka } = require('kafkajs');

if (process.argv.length !== 4) {
  console.log('Usage: node consumer.js <topic> <groupId>');
  process.exit(-1);
}
const myTopic = process.argv[2];
const mygGroupId = process.argv[3];

const kafka = new Kafka({
  clientId: 'my-consumer',
  brokers: ['localhost:29092']
});

const consumer = kafka.consumer({ groupId: mygGroupId});

const runConsumer = async () => {

  await consumer.connect();
  await consumer.subscribe({ topic: myTopic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = JSON.parse(message.value.toString());
      console.log(`Received message ${JSON.stringify(value)} on topic ${topic}, grupo: ${mygGroupId} partition ${partition}`);
    }
  });
};

runConsumer().catch(console.error);

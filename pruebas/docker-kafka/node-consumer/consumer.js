const { Kafka } = require('kafkajs');
const { MongoClient } = require('mongodb');

const kafka = new Kafka({
  clientId: 'my-consumer',
  brokers: ['localhost:29092']
});

const consumer = kafka.consumer({ groupId: 'my-group' });

const runConsumer = async () => {
  const client = new MongoClient('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await client.connect();
  const db = client.db('numtest');
  const collection = db.collection('numtest');

  await consumer.connect();
  await consumer.subscribe({ topic: 'numtest', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = JSON.parse(message.value.toString());
      await collection.insertOne(value);
      console.log(`${JSON.stringify(value)} added to ${collection.namespace}`);
    }
  });
};

runConsumer().catch(console.error);

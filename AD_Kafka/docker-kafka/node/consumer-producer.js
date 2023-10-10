const { Kafka } = require('kafkajs');

if (process.argv.length !== 5) {
  console.log('Usage: node consumerProducer.js <topic1> <grupoTopic1> <topic2>');
  process.exit(-1);
}

const topic1 = process.argv[2];
const grupoTopic1 = process.argv[3];
const topic2 = process.argv[4];

const kafka = new Kafka({
  clientId: 'my-consumer-producer',
  brokers: ['localhost:29092']
});

const consumer = kafka.consumer({ groupId: grupoTopic1 });
const producer = kafka.producer();

const runConsumerProducer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: topic1, fromBeginning: true });

  await producer.connect();

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = JSON.parse(message.value.toString());
      console.log(`Received message ${JSON.stringify(value)} on topic ${topic}, grupo: ${grupoTopic1} partition ${partition}`);

      // Enviar mensaje al otro topic
      const newMessage = `reenviando ${JSON.stringify(value)} con topic ${topic2}`;
      try {
        await producer.send({
          topic: topic2,
          messages: [
            { value: JSON.stringify(newMessage) }
        ]
        });
        console.log('Message sent to', topic2, ':', newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  });
};

runConsumerProducer().catch(console.error);

const { Kafka } = require('kafkajs');


if (process.argv.length !== 3) {
  console.log('Usage: node producer.js <topic>');
  process.exit(-1);
}
const myTopic = process.argv[2];


const kafka = new Kafka({
  clientId: 'my-producer',
  brokers: ['0.0.0.0:29092']
});

let counter = 0;

const producer = kafka.producer();

const runProducer = async () => {
  await producer.connect();

  setInterval(async () => {
    const message = {
      number: counter++
    };

    try {
      await producer.send({
		topic: myTopic,
        messages: [
          { value: JSON.stringify(message) }
        ]
      });
      console.log('Message sent:', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, 5000); // Envia un mensaje cada 5 segundos
};

runProducer().catch(console.error);

const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-producer',
  brokers: ['localhost:29092']
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
        topic: 'numtest2',
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

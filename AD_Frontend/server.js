const express = require('express');
const { Kafka } = require('kafkajs');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT;
if (!PORT) {
  throw new Error('PORT not set');
}


const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['0.0.0.0:29092'] // Coloca la dirección de tu broker de Kafka
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index2.html');
});

async function run() {
  const consumer = kafka.consumer({ groupId: 'test-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'map', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("New map received. ")
      const parsedMessage = JSON.parse(message.value.toString());
      io.emit('map', parsedMessage);
    }
  });
}

run().catch(console.error);

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

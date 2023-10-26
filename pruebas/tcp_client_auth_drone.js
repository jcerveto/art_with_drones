const net = require('net');

if (process.argv.length !== 6) {
    console.log('Usage: node tcp_client.js <host> <port> <droneId> <droneToken>');
    process.exit(1);
}

const HOST = process.argv[2];
const PORT = parseInt(process.argv[3]);
const droneId = parseInt(process.argv[4])
const droneToken = process.argv[5]                  

// POR DEFECTO:
// DRONEid: 10
// TOKEN: token-10

console.log('Connecting to ' + HOST + ':' + PORT);

const client = new net.Socket();

client.on('connect', () => {
    console.log('Connected to ' + HOST + ':' + PORT);

    const message = {
        id_registry: droneId,
        token: droneToken
    }
    const messageJson = JSON.stringify(message);
    client.write(messageJson.toString('utf-8')); // No es necesario convertir a UTF-8
});

client.on('data', data => {
    console.log('Received data: ' + data.toString('utf-8'));
    client.end();
});

client.on('close', () => {
    console.log('Client connection closed');
});

client.on('error', err => {
    console.error('Error: ' + err);
});

client.on('end', () => {
    console.log('Finished');
    client.destroy();
});

client.connect(PORT, HOST);

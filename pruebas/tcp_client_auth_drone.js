const net = require('net');

if (process.argv.length !== 4) {
    console.log('Usage: node tcp_client.js <host> <port>');
    process.exit(1);
}

const HOST = process.argv[2];
const PORT = parseInt(process.argv[3]);

console.log('Connecting to ' + HOST + ':' + PORT);

const client = new net.Socket();

client.on('connect', () => {
    console.log('Connected to ' + HOST + ':' + PORT);
    /**
     * 
// AUTHENTICATION drone->engine
{
	"id_registry": 0,
	"token": ""
}

     */
    const message = {
        id_registry: 0,
        token: "hola"
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

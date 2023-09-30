const net = require('net');

class TCPClient {
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.socket = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.socket = net.Socket();

            this.socket.on('connect', () => {
                resolve();
            });

            this.socket.on('error', (err) => {
                reject(err);
            });

            this.socket.connect(this.port, this.host);
        });
    }

    send(message) {
        return new Promise((resolve, reject) => {
            this.socket.write(message, 'utf8', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    receive() {
        return new Promise((resolve, reject) => {
            this.socket.on('data', (data) => {
                resolve(data.toString('utf8'));
            });

            this.socket.on('error', (err) => {
                reject(err);
            });
        });
    }

    close() {
        this.socket.end();
    }
}

async function main() {
    if (process.argv.length != 4) {
        console.log('Usage: node tcp_server.js <host> <port>');
        process.exit(1);
    }
    const HOST = process.argv[2];
    const PORT = process.argv[3]

    const client = new TCPClient(HOST, PORT);

    await client.connect();

    const currentSquare = `${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 20) + 1}`;
    const targetSquare = `${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 20) + 1}`;
    const dron = {
        id: 1,
        target:  targetSquare,
        current:  currentSquare,
    }
    const message = JSON.stringify(dron);
    console.log(`Sending to the server: ${message}`);
    await client.send(message.toString('utf8'));

    const response = await client.receive();

    console.log(`Received from the server: ${response.toString('utf8')}`);

    client.close();
}

main();

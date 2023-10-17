const net = require('net');

const server = net.createServer(conn => {
    console.log('new client');

    conn.on('data', data => {
        conn.write(data.toString("utf-8") + '\r\n' + data.toString("utf-8"));
        conn.end();
    });

    conn.on('end', () => {
        console.log('client left');
    });

    conn.on('close', () => {
        console.log('client closed connection');
    });
});


if (process.argv.length != 3) {
    console.log('Usage: node tcp_server.js <port>');
    process.exit(1);
}
PORT = process.argv[2]
server.listen(PORT, () => {
    console.log('listening on localhost:' + PORT);
});
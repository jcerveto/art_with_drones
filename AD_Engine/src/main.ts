import { ServerEntity } from './model/ServerEntity';

// Example usage
if (process.argv.length != 3) {
    console.log('Usage: node tcp_server.js <port>');
    process.exit(1);
}


try {
    const port = parseInt(process.argv[2]);
    const host = '0.0.0.0';
    const server = new ServerEntity(port, host);
    server.startFigure()
        .catch((err) => console.error(err));
}
catch (err) {
    console.error(err);
    process.exit(1);
}

import { ServerEntity } from './model/ServerEntity';

// Example usage
if (process.argv.length != 3) {
    console.log('Usage: node tcp_server.js <port>');
    process.exit(1);
}


try {
    const port = parseInt(process.argv[2]);
    const server = new ServerEntity(port);
    server.start();
}
catch (err) {
    console.log(err);
    process.exit(1);
}

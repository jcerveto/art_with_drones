import * as net from 'net';
import { ServerImplementation } from '../implementation/ServerImplementation';

export class ServerEntity {
    private server: net.Server;
    private port: number;

    public static MIN_VALID_TEMPERATURE = 0;

    public getServer(): net.Server {
        return this.server;
    }

    public getPort(): number {
        return this.port;
    }

    public constructor(port: number) {
        this.port = port;
        this.server = net.createServer(this.handleClient.bind(this));
    }

    public handleClient(conn: net.Socket) {
        try {
            ServerImplementation.handleClient(conn);
        }
        catch (err) {
            console.error(`ERROR: Trying to handle client: ${err}`);
        }
    }

    public start() {
        try {
            ServerImplementation.start(this);
        }
        catch (err) {
            console.error(`ERROR: Trying to start: ${err}`);
        }
    }

    
}

import * as net from 'net';
import { ServerImplementation } from '../implementation/ServerImplementation';
import { MapEntity } from './MapEntity';

export class ServerEntity {
    private server: net.Server;
    private port: number;
    private map: MapEntity;

    public static MIN_VALID_TEMPERATURE = 0;

    public getServer(): net.Server {
        return this.server;
    }

    public getPort(): number {
        return this.port;
    }

    public getMap(): MapEntity {
        return this.map;
    }

    public constructor(port: number) {
        this.port = port;
        this.server = net.createServer(this.handleClient.bind(this));
        this.map = new MapEntity(20);
    }

    public handleClient(conn: net.Socket) {
        try {
            ServerImplementation.handleClient(this, conn);
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

    public showMap() {
        try {
            ServerImplementation.showMap(this);
        }
        catch (err) {
            console.error(`ERROR: Trying to show map: ${err}`);
        }
    }


    
}

import { MapEntity } from "./MapEntity";
import {ServerImplementation} from "../implementation/ServerImplementation";
import * as net from "net";
import {SquareEntity} from "./SquareEntity";

export class ServerEntity {
    private _host: string;
    private _port: number;
    private _map: MapEntity;
    private _serverNet: net.Server;

    public getHost(): string {
        return this._host;
    }

    public getPort(): number {
        return this._port;
    }

    public getMap(): MapEntity {
        return this._map;
    }

    public getServer(): net.Server {
        return this._serverNet;
    }


    public constructor(port: number, host: string) {
        this._host = host;
        this._port = port;

        this._serverNet = this.createNetServer();
        this._map = new MapEntity();
    }

    public start(): void {
        try {
            ServerImplementation.start(this);
        } catch (err) {
            throw new Error('Error starting! Closing server...');
        }
    }

    public handleClientAuthentication(conn: net.Socket): void {
        try {
            ServerImplementation.handleClientAuthentication(this, conn);
        }
        catch (err) {
            console.error(`ERROR: Trying to handle client: ${err}`);
        }
    }

    public getTargetSquareFromDronId(dronId: number): SquareEntity | null {
        try {
            return ServerImplementation.getTargetSquareFromDronId(this, dronId);
        } catch (err) {
            console.error('ERROR: at getTargetSquareFromDronId: ', err.message);
        }
    }

    private createNetServer(): net.Server {
        return ServerImplementation.createNetServer(this);
    }
}
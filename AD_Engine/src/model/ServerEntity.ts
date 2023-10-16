import { MapEntity } from "./MapEntity";
import {ServerImplementation} from "../implementation/ServerImplementation";
import * as net from "net";
import {SquareEntity} from "./SquareEntity";
import {DronEntity} from "./DronEntity";
import {WaitingPoolEntity} from "./WaitingPoolEntity";

export class ServerEntity {
    private _host: string;
    private _port: number;
    private _map: MapEntity;
    private _serverNet: net.Server;
    private _waitingPool: WaitingPoolEntity = new WaitingPoolEntity();

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

    public getWaitingPool(): WaitingPoolEntity {
        return this._waitingPool;
    }

    public constructor(port: number, host: string) {
        this._host = host;
        this._port = port;

        this._serverNet = this.createNetServer();
        this._map = new MapEntity();
    }

    private createNetServer(): net.Server {
        return ServerImplementation.createNetServer(this);
    }

    public start(): void {
        try {
            ServerImplementation.start(this)
                .then(() => {
                    console.log("Server started!");
                })
                .catch((err) => {
                    console.error("Error starting! Closing server...", err);
                })
        } catch (err) {
            throw new Error('Error starting! Closing server...' + err);
        }
    }

    public async startFigure(): Promise<void> {
        try {
            await ServerImplementation.startFigure(this);
        } catch (err) {
            console.error("Error starting figure!", err);
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

    // BROKER'S METHODS
    public subscribeToDrones(): void {
        try {
            ServerImplementation.subscribeToDrones(this);
        } catch (err) {
            console.error(err.message);
        }
    }

    public async sendMapToDrones() {
        try {
            await ServerImplementation.sendMapToDrones(this);
        } catch (err) {
            console.error(err.message);
        }
    }

    public async weatherStuff(): Promise<void> {
        try {
            await ServerImplementation.weatherStuff(this);
        } catch (err) {
            console.error("ERROR: Trying to weatherStuffs. ", err);
        }
    }

    public async isWeatherValid(): Promise<boolean> {
        try {
            return await ServerImplementation.isWeatherValid(this);
        } catch (err) {
            console.error("ERROR: Trying to weatherStuffs. ", err);
        }
    }

    public async handleBadWeather(): Promise<void> {
        try {
            await ServerImplementation.handleBadWeather(this);
        } catch (err) {
            console.error("ERROR: Trying to handleBadWeather. ", err);
        }
    }

    public sendDronesToBase(): void {
        try {
            ServerImplementation.sendDronesToBase(this);
        } catch (err) {
            console.error("ERROR: Trying to sendDronesToBase. ", err);
        }
    }

    public readyToStartFigure(): boolean {
        try {
            return ServerImplementation.readyToStartFigure(this);
        } catch (err) {
            console.error("ERROR: Trying to readyToStartFigure. Retuning false ", err);
            return false;
        }
    }
}
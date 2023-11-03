import { MapEntity } from "./MapEntity";
import {ServerImplementation} from "../implementation/ServerImplementation";
import * as net from "net";
import {SquareEntity} from "./SquareEntity";
import {WaitingPoolEntity} from "./WaitingPoolEntity";
import {FigureEntity} from "./FigureEntity";
import * as ServerSettings from "../settings/ServerSettings";

export class ServerEntity {
    public MAX_CONCURRENT_CONNECTIONS: number = ServerSettings.MAX_CONCURRENT_CONNECTIONS;

    private _host: string;
    private _port: number;
    private _map: MapEntity;
    private _serverNet: net.Server;
    private _waitingPool: WaitingPoolEntity = new WaitingPoolEntity();
    private _figures = Array<FigureEntity>();
    private _showActive: boolean = false;
    private _currentFigure: FigureEntity | null = null;
    private _currentConcurrentConnections: number = 0;

    public getCurrentConcurrentConnections(): number {
        return this._currentConcurrentConnections;
    }

    public incrementCurrentConcurrentConnections(): void {
        this._currentConcurrentConnections++;
    }

    public decrementCurrentConcurrentConnections(): void {
        this._currentConcurrentConnections--;
    }

    public getShowActive(): boolean {
        return this._showActive;
    }

    public activateShow(): void {
        this._showActive = true;
    }

    public deactivateShow(): void {
        this._showActive = false;
    }

    public getCurrentFigure(): FigureEntity | null {
        return this._currentFigure;
    }

    public addCurrentFigure(figure: FigureEntity): void {
        this._currentFigure = figure;
    }

    public clearCurrentFigure(): void {
        this._currentFigure = null;
    }

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

    public async start(): Promise<void> {
        try {
            await ServerImplementation.start(this)
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

    public async getTargetSquareFromDronId(dronId: number): Promise<SquareEntity> {
        try {
            return await ServerImplementation.getTargetSquareFromDronId(this, dronId);
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

    public async sendDronesToBase() {
        try {
            await ServerImplementation.sendDronesToBase(this);
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

    public loadFigures(): void {
        try {
            ServerImplementation.loadFigures(this);
        } catch (err) {
            console.error("ERROR: Trying to loadFigures. ", err);
        }
    }

    public getFigures(): Array<FigureEntity> {
        return this._figures;
    }

    public addFigure(figure: FigureEntity): void {
        this._figures.push(figure);
    }

    public clearFigures(): void {
        this._figures = [];
    }

    public async startShow(): Promise<void> {
        try {
            await ServerImplementation.startShow(this);
        } catch (err) {
            console.error("ERROR: Trying to startShow. ", err);
        }
    }
}
import { MapEntity } from "./MapEntity";
import {ServerImplementation} from "../implementation/ServerImplementation";
import * as net from "net";
import {SquareEntity} from "./SquareEntity";
import {WaitingPoolEntity} from "./WaitingPoolEntity";
import {FigureEntity} from "./FigureEntity";
import * as ServerSettings from "../settings/ServerSettings";
import {DronEntity} from "./DronEntity";
import {EKeepAliveStatus} from "./EKeepAliveStatus";
import {sleep} from "../implementation/TimeUtils";
import * as Logger from "../settings/LoggerSettings";
import * as SecurityImplementation from "../implementation/SecurityImplementation";


export class ServerEntity {
    public MAX_CONCURRENT_CONNECTIONS: number = ServerSettings.MAX_CONCURRENT_CONNECTIONS;
    public GENERAL_KEY = null;

    private _host: string;
    private _port: number;
    private _map: MapEntity;
    private _serverNet: net.Server;
    private _waitingPool: WaitingPoolEntity = new WaitingPoolEntity();
    private _figures = Array<FigureEntity>();
    private _showActive: boolean = false;
    private _currentFigure: FigureEntity | null = null;
    private _currentConcurrentConnections: number = 0;
    private _isWeatherValid: boolean = true;

    /**
     * Map that stores the keys of the drones.
     * key: droneId (number)
     * value: private key (string)
     * @private
     */
    private _keysMap: Map<number, string> = new Map<number, string>();

    public getKey(drone: DronEntity): string {
        return this._keysMap.get(drone.getId());
    }

    public setKey(drone: DronEntity, key: string): void {
        this._keysMap.set(drone.getId(), key);
    }


    /**
     * Podrían editar concurrentemente el mapa si no se controla desde:
     * - Map.MoveDrone(*)
     * - UpdateAliveDrones(*)
     * @private
     */
    private _mapEditorSemaphoreAvailable: boolean = true;

    /**
     * Map that stores the time of the message received from the drone.
     * key: droneId (number)
     * value: time (number) (Date.now())
     * @private
     */
    private  _dronesTimeMap: Map<number, number> = new Map<number, number>();

    public async updateAliveDrones() {
        try {
            // si no está activo el show, no actualizar. No cambiar estado de los drones
            if (!this.getShowActive()) {
                return;
            }

            const aliveDronesInit: Array<number> = this.getMap().getAliveDrones().map((drone: DronEntity) => drone.getId());

            while (!this.isMapEditorAvailable()) {
                console.log(`${'&'.repeat(50)}\nWaiting for editor to be available... Calling from ServerEntity.updateAliveDrones${'&'.repeat(50)}\n`);
                await sleep(200);
            }
            this.setEditorNotAvailable();
            // actualizar status de los drones
            //console.log(`${'-'.repeat(50)}\nUpdating alive drone status...\n${'-'.repeat(50)}\n`)
            for (let drone of this.getMap().getAllDrones()) {
                if (this.isDroneAlive(drone)) {
                    drone.setStatus(EKeepAliveStatus.ALIVE)
                } else {
                    drone.setStatus(EKeepAliveStatus.DEAD);
                }
            }
            // publicar mapa
            await this.sendMapToDrones();

            this.setEditorAvailable();

            const aliveDronesEnd: Array<number> = this.getMap().getAliveDrones().map((drone: DronEntity) => drone.getId());
            const deadsIds: Array<number> = aliveDronesInit.filter((id: number) => !aliveDronesEnd.includes(id));
            if (aliveDronesInit.length > aliveDronesEnd.length) {
                await Logger.addNewLog({
                    dataTime: new Date().toISOString(),
                    ipAddr: "0.0.0.0",
                    action: "DroneDead",
                    description: `Drone/s ${deadsIds} died. `
                })
            }
        } catch (err) {
            console.error("ERROR: Trying to updateAliveDrones. ", err);
            this.setEditorAvailable();
        } finally {
            this.setEditorAvailable();
        }
    }

    public async publishCommunicationMessage(message: string): Promise<void> {
        try {
            await ServerImplementation.publishCommunicationMessage(this, message);
        } catch (err) {
            console.error("ERROR: Trying to publishCommunicationMessage. ", err);
        }
    }

    public setEditorAvailable(): void {
        this._mapEditorSemaphoreAvailable = true;
    }

    public setEditorNotAvailable(): void {
        this._mapEditorSemaphoreAvailable = false;
    }

    public isMapEditorAvailable(): boolean {
        return this._mapEditorSemaphoreAvailable;
    }


    public deleteDroneTimeStamp(drone: DronEntity): void {
        this._dronesTimeMap.delete(drone.getId());
    }

    public updateNewDroneTimeStamp(drone: DronEntity): void {
        this._dronesTimeMap.set(drone.getId(), Date.now());
    }

    public getDroneTime(drone: DronEntity): number {
        return this._dronesTimeMap.get(drone.getId());
    }

    public isDroneAlive(drone: DronEntity): boolean {
        try {
            return Date.now() - this.getDroneTime(drone) < ServerSettings.KEEP_ALIVE_TIMEOUT;
        } catch (err) {
            console.error("ERROR: Trying to isDroneAlive. Probablemente el dron no esté en el timestampmap. Returning false ", err);
            return false;
        }
    }

    public getIsWeatherValid(): boolean {
        return this._isWeatherValid;
    }

    public setWeatherToBad(): void {
        this._isWeatherValid = false;
    }

    public setWeatherToGood(): void {
        this._isWeatherValid = true;
    }

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

        this._serverNet = null;//this.createNetServer();
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


    public handleClientAuthentication(conn: net.Socket): void {
        try {
            ServerImplementation.handleClientAuthentication(this, conn);
        }
        catch (err) {
            console.error(`ERROR: Trying to handle client: ${err}`);
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

    public async handleGoodWeather(): Promise<void> {
        try {
            await ServerImplementation.handleGoodWeather(this);
        } catch (err) {
            console.error("ERROR: Trying to handleGoodWeather. ", err);
        }
    }

    public async sendDronesToBase() {
        try {
            console.log("Sending drones to base...");

            await ServerImplementation.sendDronesToBase(this);
        } catch (err) {
            console.error("ERROR: Trying to sendDronesToBase. Re-Raising ", err);
            throw err;
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

    public async recover() {
        try {
            await ServerImplementation.recover(this);
        } catch (err) {
            console.error("ERROR: Trying to recover. ", err);
        }
    }

    public async generateToken(drone: DronEntity, timestamp: number): Promise<string> {
        try {
            const message = `${drone.getId()}#${timestamp}`;
            return await SecurityImplementation.encryptMessageBase64(message);
        } catch (err) {
            console.error("ERROR: Trying to generateToken. ", err);
            return "";
        }
    }
}
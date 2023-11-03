import {DronEntity} from "./DronEntity";
import {EStatus, getEStatusToString} from "./EStatus";
import {EKeepAliveStatus} from "./EKeepAliveStatus";


export class SquareEntity {
    public static readonly MAX_SIZE: number = 20;
    public static readonly MIN_SIZE: number = 1;
    private __row: number = 1;
    private __column: number = 1;
    private __drones: Map<string, DronEntity> = new Map<string, DronEntity>();

    constructor(row: number, column: number) {
        if (row < SquareEntity.MIN_SIZE || row > SquareEntity.MAX_SIZE) {
            throw new Error(`Invalid row number (${row})}`);
        }
        if (column < SquareEntity.MIN_SIZE || column > SquareEntity.MAX_SIZE) {
            throw new Error(`Invalid column number (${column})`);
        }

        this.__row = row;
        this.__column = column;
    }

    public getAliveDrones(): Array<DronEntity> {
        let drones: Array<DronEntity> = [];

        for (let [droneHash, drone] of this.__drones) {
            if (drone.getStatus() == EKeepAliveStatus.ALIVE) {
                drones.push(drone);
            }
        }

        return drones;
    }

    public getDeadDrones(): Array<DronEntity> {
        let drones: Array<DronEntity> = [];

        for (let [droneHash, drone] of this.__drones) {
            if (drone.getStatus() == EKeepAliveStatus.DEAD) {
                drones.push(drone);
            }
        }

        return drones;
    }

    public getAllDrones(): Array<DronEntity> {
        let dronesArray: Array<DronEntity> = [];

        for (let [droneHash, drone] of this.__drones) {
            dronesArray.push(drone);
        }

        return dronesArray;
    }

    public getRow(): number {
        return this.__row;
    }

    public setRow(row: number) {
        this.__row = row;
    }

    public getColumn(): number {
        return this.__column;
    }

    public setColumn(column: number) {
        this.__column = column;
    }

    public isEmpty(): boolean {
        if (this.__drones === null) {
            return true;
        }

        return this.__drones.size == 0;
    }

    public addDrone(drone: DronEntity): void {
        const droneHash = drone.getHash();
        this.__drones.set(droneHash, drone);
    }

    public removeDrone(drone: DronEntity): void {
        const droneHash = drone.getHash();
        this.__drones.delete(droneHash);
    }

    public toString(): string {
        const status: EStatus = this.getSquareStatus();

        if (status === EStatus.GOOD) {
            return '■';
        }
        if (status === EStatus.BAD) {
            return '▤';
        }
        if (status === EStatus.UNKNOWN) {
            return '□';
        }

        return '?';
    }

    public toJson(): string {
        const status: EStatus = this.getSquareStatus();
        const statusString: string = getEStatusToString(status);

        const jsonFormat = {
            "row": this.__row,
            "col": this.__column,
            "status": statusString
        };

        return JSON.stringify(jsonFormat);
    }


    public getHash(): string {
        return `${this.__row}-${this.__column}`;
    }

    public equals(other: null | SquareEntity): boolean {
        if (other === null || other === undefined) {
            return false;
        }
        return this.__row === other.__row && this.__column === other.__column;
    }

    public getSquareStatus(): EStatus {
        const aliveDrones = this.getAliveDrones();

        if (!aliveDrones || aliveDrones.length === 0) {
            return EStatus.UNKNOWN;
        }

        if (aliveDrones.length > 1) {
            return EStatus.BAD;
        }

        if (aliveDrones.length === 1 && aliveDrones[0].getTargetSquare().equals(this)) {
            return EStatus.GOOD;
        }

        return EStatus.BAD;
    }


    public static fromJson(json: any): SquareEntity {
        try {
            if (!json) {
                console.error(`ERROR: Trying to parse json: ${json}`);
                return;
            }
            let row: number = 0;
            let col: number = 0;

            if (json && json.currentPosition && json.currentPosition.row !== undefined && json.currentPosition.col !== undefined) {
                row = parseInt(json.currentPosition.row);
                col = parseInt(json.currentPosition.col);
            } else {
                return null;
            }
            return new SquareEntity(row, col);
        }
        catch (err) {
            console.error(`ERROR: Trying to parse json: ${err}`);
            return null;
        }
    }


}
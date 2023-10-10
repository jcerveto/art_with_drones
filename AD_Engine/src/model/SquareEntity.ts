import {DronEntity} from "./DronEntity";
import {EStatus, getEStatusToString} from "./EStatus";


export class SquareEntity {
    public static readonly MAX_SIZE: number = 20;
    public static readonly MIN_SIZE: number = 1;
    private __row: number = 1;
    private __column: number = 1;
    private __drones: Map<string, DronEntity> = new Map<string, DronEntity>();

    constructor(row: number, column: number) {
        if (row < SquareEntity.MIN_SIZE || row > SquareEntity.MAX_SIZE) {
            throw new Error('Invalid row number');
        }
        if (column < SquareEntity.MIN_SIZE || column > SquareEntity.MAX_SIZE) {
            throw new Error('Invalid column number');
        }

        this.__row = row;
        this.__column = column;
    }

    public getDrones(): Map<string, DronEntity> {
        return this.__drones;
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
        if (this.__drones === null || this.__drones.size == 0) {
            return '■';
        }

        if (this.__drones.size > 1) { // hay varios drones en la misma posicion, al menos 1 estará mal colocado
            return 'R';
        }

        return this.__drones[0]?.toString();    // Solo hay un dron
    }

    public toJson(): string {
        const status: EStatus = this.getStatus();
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
        if (!other) {
            return false;
        }
        return this.__row === other.__row && this.__column === other.__column;
    }

    public getStatus(): EStatus {
        if (this.__drones == null || this.__drones == undefined) {
            return EStatus.UNKNOWN;
        }
        if (this.__drones.size > 1) {
            return EStatus.BAD;
        }

        if (this.equals(this.__drones[0]?.getTargetSquare())) {
            return EStatus.GOOD;
        } else {
            return EStatus.BAD;
        }
    }

    public static fromString(str: string): SquareEntity {
        try {
            const parts = str.split('-');
            return new SquareEntity(parseInt(parts[0]), parseInt(parts[1]));
        }
        catch (err) {
            throw new Error('Invalid square format. string: ' + str);
        }
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
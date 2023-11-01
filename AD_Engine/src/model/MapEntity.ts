import {SquareEntity} from "./SquareEntity";
import {DronEntity} from "./DronEntity";
import {EKeepAliveStatus} from "./EKeepAliveStatus";
import { FigureEntity } from "./FigureEntity";
import { EStatus } from "./EStatus";

export class MapEntity {
    public static SIZE: number = 20;

    private __map: Map<
        string,
        SquareEntity
    > = new Map<string, SquareEntity>();

    public getMapObject(): Map<string, SquareEntity> {
        return this.__map;
    }


    constructor() {
        for (let row = 1; row <= MapEntity.SIZE; row++) {
            for (let column = 1; column <= MapEntity.SIZE; column++) {
                const square = new SquareEntity(row, column);
                this.__map.set(square.getHash(), square);
            }
        }
    }



    public toString(): string {
        let buffer = '  ';

        for (let i = 1; i <= MapEntity.SIZE; i++) {
            buffer += `${i}`.padStart(2, ' ');
        }
        buffer += '\n';

        for (let row = 1; row <= MapEntity.SIZE; row++) {
            buffer += `${row}`.padStart(2, ' ');

            for (let column = 1; column <= MapEntity.SIZE; column++) {
                const square = this.__map.get(`${row}-${column}`);
                buffer += square.toString().padStart(2, ' ');
            }
            buffer += '\n';
        }

        return buffer;
    }

    public getAliveDrones(): Array<DronEntity> {
        const drones: Array<DronEntity> = [];

        this.__map.forEach((square: SquareEntity) => {
            square.getAliveDrones().forEach((drone: DronEntity) => {
                drones.push(drone);
            });
        });

        return drones;
    }

    public getDeadDrones(): Array<DronEntity> {
        const drones: Array<DronEntity> = [];

        this.__map.forEach((square: SquareEntity) => {
            square.getDeadDrones().forEach((drone: DronEntity) => {
                drones.push(drone);
            });
        });

        return drones;
    }

    public getAllDrones(): Array<DronEntity> {
        const drones: Array<DronEntity> = [];

        this.__map.forEach((square: SquareEntity) => {
            square.getAllDrones().forEach((drone: DronEntity) => {
                drones.push(drone);
            });
        });

        return drones;
    }


    public toJson(): string {
        try {
            const jsonArray: Array<string> = [];

            this.__map.forEach((square: SquareEntity) => {
                jsonArray.push(square.toJson());
            });

            return JSON.stringify(jsonArray);
        } catch (err) {
            console.error("ERROR: Parsing Map toJson. Returning empty object. ", err);
            return JSON.stringify({});
        }

    }

    public isDroneInMap(obj: DronEntity): boolean {
        const drones = this.getAllDrones();

        let found = false;
        drones.forEach((droneInMap: DronEntity) => {
            if (droneInMap.equals(obj)) {
                found = true;
            }
        });

        return found;
    }

    public getSquareByDrone(droneEntity: DronEntity): SquareEntity | null {
        let currentSquare: SquareEntity = null;
        this.__map.forEach((square: SquareEntity) => {
            square.getAllDrones().forEach((drone: DronEntity) => {
                if (drone.equals(droneEntity)) {
                    currentSquare = square;
                }
            });
        });

        return currentSquare;
    }

    public moveDrone(droneEntity: DronEntity, squareEntity: SquareEntity) {
        if (!this.isDroneInMap(droneEntity)) {
            throw new Error(`ERROR: Drone ${droneEntity.getId()} not in map.`);
        }

        const currentSquare = this.getSquareByDrone(droneEntity);
        if (currentSquare === null) {
            throw new Error(`ERROR: Drone ${droneEntity.getId()} not in map.`);
        }

        this.removeDrone(droneEntity);
        this.addDrone(droneEntity, squareEntity);
    }

    public changeDroneStatus(drone: DronEntity, newState: EKeepAliveStatus): void {
        try {
            this.__map.forEach((square: SquareEntity) => {
                square.getAllDrones().forEach((droneInMap: DronEntity) => {
                    if (droneInMap.equals(drone)) {
                        droneInMap.setStatus(newState);
                        return;
                    }
                });
            });

            //throw new RangeError(`ERROR: Drone ${drone.getId()} not in map.`);
        } catch (err) {
            console.error(`ERROR: While changing drone status: ${err}`)
        }
    }

    public addDrone(drone: DronEntity, square: SquareEntity): void {
        if (this.isDroneInMap(drone)) {
            console.warn(`WARNING: Can not add Drone ${drone.getId()} is already in map. Continuing...`);
        }

        this.__map.forEach((squareInMap: SquareEntity) => {
            if (squareInMap.equals(square)) {
                squareInMap.addDrone(drone);
            }
        });
    }

    public removeDrone(drone: DronEntity): void {
        if (! this.isDroneInMap(drone)) {
            console.warn(`WARNING: Can not remove Drone ${drone.getId()} not in map. Continuing...`);
        }

        const squareReference = this.getSquareByDrone(drone);

        this.__map.forEach((squareInMap: SquareEntity) => {
            if (squareInMap.equals(squareReference) || JSON.stringify(squareInMap) === JSON.stringify(squareReference)) {
                console.log("BORRANDO...")
                squareInMap.removeDrone(drone);
            }
        });
    }

    public matchesWithFigure(figure: FigureEntity): boolean {
        if (figure === null || figure === undefined) {
            console.error("ERROR: figure is null or undefined. Returning false.");
            return false;
        }

        try {
            for (let [key, value] of figure.getFigure()) {
                // si no existe la casilla en el mapa
                if (!this.__map.has(key)) {
                    return false;
                }
                // si hay un numero diferente a 1 de drones vivos en dicha casilla
                const dronesInSquare = this.__map.get(key).getAliveDrones();
                if (dronesInSquare.length !== 1) {
                    return false;
                }
                // comparar si el unico dron de la casilla es el que estamos buscando
                const droneToTest = new DronEntity(value);
                if (!dronesInSquare[0].equals(droneToTest)) {
                    return false;
                }

                // COINCIDE!! Seguimos comprbando los demas
            }
            return true;
        } catch (err) {
            console.error("ERROR: at matchesWithMap. Returned false: ", err.message);
            return false;
        }
    }

    public getStatusArray(): string[][] {
        function getStringFromStatus(status: EStatus): string {
            switch (status) {
                case EStatus.UNKNOWN:
                    return 'empty';
                case EStatus.GOOD:
                    return 'good';
                case EStatus.BAD:
                    return 'bad';
                default:
                    return 'empty';
            }
        }
        let statusArray: string[][] = [];

        // Inicializar la matriz con espacios en blanco
        for (let i = 0; i < MapEntity.SIZE; i++) {
            statusArray[i] = [];
            for (let j = 0; j < MapEntity.SIZE; j++) {
                statusArray[i][j] = getStringFromStatus(EStatus.UNKNOWN);
            }
        }

        for (let row = 1; row <= MapEntity.SIZE; row++) {
            for (let column = 1; column <= MapEntity.SIZE; column++) {
                const square = this.__map.get(`${row}-${column}`);
                statusArray[row - 1][column - 1] = getStringFromStatus(square.getStatus());
            }
        }

        return statusArray;
    }
}
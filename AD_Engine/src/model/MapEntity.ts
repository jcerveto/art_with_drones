import {SquareEntity} from "./SquareEntity";
import {DronEntity} from "./DronEntity";
import {EKeepAliveStatus} from "./EKeepAliveStatus";
import { FigureEntity } from "./FigureEntity";
import { EStatus } from "./EStatus";
import {MapFiguraDronTable} from "./MapFiguraDronTable";
import { COMPLETE_WHEN_ALL_DRONES_ARRIVE } from "../settings/ServerSettings";

export class MapEntity {
    public static SIZE: number = 20;

    private __map: Map<
        string,
        SquareEntity
    > = new Map<string, SquareEntity>();


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

        for (let [hexSquare, squareMap] of this.__map) {
            for (let drone of squareMap.getAliveDrones()) {
                drones.push(drone);
            }
        }

        return drones;
    }

    public getDeadDrones(): Array<DronEntity> {
        const drones: Array<DronEntity> = [];

        for (let [hexSquare, squareMap] of this.__map) {
            for (let drone of squareMap.getDeadDrones()) {
                drones.push(drone);
            }
        }

        return drones;
    }

    public getAllDrones(): Array<DronEntity> {
        const drones: Array<DronEntity> = [];

        for (let [hexSquare, squareMap] of this.__map) {
            for (let drone of squareMap.getAllDrones()) {
                drones.push(drone);
            }
        }

        return drones;
    }


    public toJson(): string {
        try {
            const jsonArray: Array<string> = [];

            for (let [hexSquare, squareMap] of this.__map) {
                jsonArray.push(squareMap.toJson());
            }

            return JSON.stringify(jsonArray);
        } catch (err) {
            console.error("ERROR: Parsing Map toJson. Returning empty object. ", err);
            return JSON.stringify({});
        }

    }

    public isDroneInMap(obj: DronEntity): boolean {
        const drones = this.getAllDrones();

        for (let [hexSquare, squareMap] of this.__map) {
            for (let drone of squareMap.getAllDrones()) {
                if (drone.equals(obj)) {
                    return true;
                }
            }
        }

        return false;
    }

    public getSquareByDrone(droneEntity: DronEntity): SquareEntity | null {
        for (let [hexSquare, squareMap] of this.__map) {
            for (let drone of squareMap.getAllDrones()) {
                if (drone.equals(droneEntity)) {
                    return squareMap;
                }
            }
        }

        return null;
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
            for (let [hexSquare, square] of this.__map) {
                for (let droneInMap of square.getAllDrones()) {
                    if (droneInMap.equals(drone)) {
                        droneInMap.setStatus(newState);
                        return;
                    }
                }
            }

            throw new RangeError(`ERROR: Drone ${drone.getId()} not in map.`);
        } catch (err) {
            console.error(`ERROR: While changing drone status: ${err} Re-Raised.`)
            throw err;
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
                squareInMap.removeDrone(drone);
            }
        });
    }

    private async matchesWhenAllArrived(figure: FigureEntity): Promise<boolean> {
        if (figure === null || figure === undefined) {
            console.error("ERROR: figure is null or undefined. Returning false.");
            return false;
        }

        try {
            let sumOfDrones = 0;

            // por cada casilla de la figura (o sea, el objetivo)
            for (let [squareHash, figureId] of figure.getFigure()) {
                // si no existe la casilla en el mapa
                if (!this.__map.has(squareHash)) {
                    return false;
                }

                const dronesInSquare = this.__map.get(squareHash).getAliveDrones();

                // comparar si el primer (pero no único) dron de la casilla es el que estamos buscando
                const [row, col] = squareHash.split('-').map(Number);
                const square = new SquareEntity(row, col);
                const id_registry = await MapFiguraDronTable.getIdRegistry(square, figureId);
                const droneToTest = new DronEntity(id_registry);
                for (let drone of dronesInSquare) {
                    if (! drone.equals(droneToTest)) {
                        return false;
                    }
                    sumOfDrones++;
                }


                // COINCIDE!! Seguimos comprobando los demás drones
                // si el dron está muerto, darlo por bueno
            }
            return true;
        } catch (err) {
            console.error("ERROR: at matchesWithMap. Returned false: ", err.message);
            return false;
        }
    }

    private async matchesWhenNDronesArrived(figure: FigureEntity, n: number): Promise<boolean> {
        try {
            let sumOfDrones = 0;

            for (let [squareHash, figureId] of figure.getFigure()) {
                // si no existe la casilla en el mapa
                if (!this.__map.has(squareHash)) {
                    return false;
                }

                const dronesInSquare = this.__map.get(squareHash).getAliveDrones();

                // comparar si el primer (pero no único) dron de la casilla es el que estamos buscando
                const [row, col] = squareHash.split('-').map(Number);
                const square = new SquareEntity(row, col);
                const id_registry = await MapFiguraDronTable.getIdRegistry(square, figureId);
                const droneToTest = new DronEntity(id_registry);
                for (let drone of dronesInSquare) {
                    if (drone.equals(droneToTest)) {
                        sumOfDrones++;
                    }

                    if (sumOfDrones >= n) {
                        return true;
                    }
                }
            }
        } catch (err) {
            console.error("ERROR: at matchesWhenNDronesArrived. Returned false: ", err.message);
            return false;
        }
    }

    public async matchesWithFigure(figure: FigureEntity): Promise<boolean> {
        if (COMPLETE_WHEN_ALL_DRONES_ARRIVE) {
            return await this.matchesWhenAllArrived(figure);
        } else {
            return await this.matchesWhenNDronesArrived(figure, 1);
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
                statusArray[row - 1][column - 1] = getStringFromStatus(square.getSquareStatus());
            }
        }

        return statusArray;
    }

    public getDroneBySquare(droneId: number) {
        try {
            const tempDrone = new DronEntity(droneId);

            for (let [hexSquare, square] of this.__map) {
                for (let drone of square.getAllDrones()) {
                    if (drone.equals(tempDrone)) {
                        return drone;
                    }
                }
            }

            throw new RangeError(`ERROR: Drone ${droneId} not in map.`);
        } catch (err) {
            console.error("ERROR: at getDroneBySquare. Re-Raised: ", err.message);
            throw err;
        }

    }
}
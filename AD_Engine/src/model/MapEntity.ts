import {SquareEntity} from "./SquareEntity";
import {DronEntity} from "./DronEntity";
import {EStatus} from "./EStatus";

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

    public getDrones(): Array<DronEntity> {
        const drones: Array<DronEntity> = [];

        this.__map.forEach((square: SquareEntity) => {
            square.getDrones().forEach((drone: DronEntity) => {
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
        const drones = this.getDrones();
        drones.forEach((droneInMap: DronEntity) => {
            if (droneInMap.equals(obj)) {
                return true;
            }
        });

        return false;
    }

    public getSquareByDrone(droneEntity: DronEntity): SquareEntity | null {
        this.__map.forEach((square: SquareEntity) => {
            square.getDrones().forEach((drone: DronEntity) => {
                if (drone.equals(droneEntity)) {
                    return square;
                }
            });
        });

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

        currentSquare.removeDrone(droneEntity);
        this.__map.forEach((square: SquareEntity) => {
            if (square.equals(squareEntity)) {
                square.addDrone(droneEntity);
            }
        });
    }

    public changeDroneStatus(drone: DronEntity, newState: EStatus): void {
        try {
            console.error("SE TIENE QUE CAMBIAR EL ESTADO. IMPLEMENTARLO!!!!")
        } catch (err) {
            console.error(`ERROR: While changing drone status: ${err}`)
        }
    }
}
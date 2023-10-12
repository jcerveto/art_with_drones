import {SquareEntity} from "./SquareEntity";
import {DronEntity} from "./DronEntity";
import {EKeepAliveStatus} from "./EKeepAliveStatus";

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
        this.__map.forEach((square: SquareEntity) => {
            square.getAllDrones().forEach((drone: DronEntity) => {
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
            console.warn(`WARNING: Drone ${drone.getId()} already in map. Continuing...`);
        }

        this.__map.forEach((squareInMap: SquareEntity) => {
            if (squareInMap.equals(square)) {
                squareInMap.addDrone(drone);
            }
        });
    }
}
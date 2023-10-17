import {DronEntity} from "./DronEntity";

export class WaitingPoolEntity {
    private __drones: Array<DronEntity> = [];

    public constructor() {

    }

    public getDrones(): Array<DronEntity> {
        return this.__drones;
    }

    public addDron(dron: DronEntity): void {
        if (this.droneExists(dron)) {
            throw new Error(`ERROR: Trying to add a dron that already exists in the waiting pool. `);
        }
        this.__drones.push(dron);
    }

    public removeDron(dron: DronEntity): void {
        this.__drones.filter((d: DronEntity) => ! d.equals(dron));
    }

    public droneExists(dron: DronEntity): boolean {
        return this.__drones.some((d: DronEntity) => d.equals(dron));
    }

    public emptyPool(): void {
        this.__drones = [];
    }
}
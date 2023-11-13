import { MapFiguraDronTableImplementation } from "../implementation/MapFiguraDronTableImplementation";
import {DronEntity} from "./DronEntity";
import {SquareEntity} from "./SquareEntity";

export class MapFiguraDronTable {

    public static async mapNewDrone(newDrone: DronEntity): Promise<boolean> {
        try {
            if (await MapFiguraDronTableImplementation.mapNewDrone(newDrone) == -1) {
                throw new Error('ERROR: Try to mapNewDrone');
            }
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    public static async getIdRegistry(square: SquareEntity, figureDroneId: number): Promise<number> {
        try {
            return await MapFiguraDronTableImplementation.getIdRegistry(square, figureDroneId);
        } catch (err) {
            console.error(err);
            throw new Error('ERROR: Try to getIdRegistry: ' + err.message);
        }
    }

    public static async forceMapNewDrone(registeredDrone: DronEntity, squareEntity: SquareEntity) {
        try {
            await MapFiguraDronTableImplementation.forceMapNewDrone(registeredDrone, squareEntity);
        } catch (err) {
            console.error(err);
            throw new Error('ERROR: Try to forceMapNewDrone: ' + err.message);
        }
    }
}

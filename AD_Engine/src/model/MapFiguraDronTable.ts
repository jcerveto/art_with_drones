import { MapFiguraDronTableImplementation } from "../implementation/MapFiguraDronTableImplementation";
import {DronEntity} from "./DronEntity";

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
}

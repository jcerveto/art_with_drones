import {MapEntity} from "./MapEntity";
import { MapFiguraDronTableImplementation } from "../implementation/MapFiguraDronTableImplementation";
import {DronEntity} from "./DronEntity";

export class MapFiguraDronTable {
    public static createEmptyFigure(mapEntity: MapEntity): boolean {
        try {
            return MapFiguraDronTableImplementation.createEmptyFigure(mapEntity);
        } catch (err) {
            console.error('ERROR. Trying to createEmptyFigure. ', err);
            return false;
        }
    }

    public static mapNewDrone(newDrone: DronEntity): boolean {
        try {
            if (MapFiguraDronTableImplementation.mapNewDrone(newDrone) == -1) {
                throw new Error('ERROR: Try to mapNewDrone');
            }
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}

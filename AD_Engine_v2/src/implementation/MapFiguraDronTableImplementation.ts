import {MapEntity} from "../model/MapEntity";
import {DronEntity} from "../model/DronEntity";

export class MapFiguraDronTableImplementation {

    static createEmptyFigure(mapEntity: MapEntity): boolean {
        return true;
    }

    /**
     * OJO: devuelve -1 si ya estan todas las posiciones asignadas.
     */
    static getNextFreeFigureId(): number {
        return 0;
    }

    /**
     * Devuelve el figuraId o -1 en caso de error.
     * OJO: devuelve -1 si ya están todas las posiciones asignadas o si no se ha podido guardar por cualquier otr motivo.
     */
    static mapNewDrone(newDrone: DronEntity): number {
        return 0;
    }
}
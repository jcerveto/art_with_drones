import {MapEntity} from "../model/MapEntity";
import {DronEntity} from "../model/DronEntity";
import sqlite3 from 'sqlite3';
import * as DatabaseSettings from "../settings/databaseSettings";

export class MapFiguraDronTableImplementation {

    /**
     * OJO: devuelve -1 si ya estan todas las posiciones asignadas.
     */
    static async mapNewDrone(drone: DronEntity): Promise<number> {
        return new Promise((resolve, reject) => {
            const queryExisteEspacio: string = `
            SELECT uk_map_figura
            FROM MapFiguraDron
            WHERE pk_fk_map_registry_id IS NULL
            LIMIT 1`;

            const db = new sqlite3.Database(DatabaseSettings.dbPath);
            db.get(queryExisteEspacio, [], (err, fila: { uk_map_figura: number }) => {
                if (err) {
                    reject(err);
                } else {
                    if (fila) {
                        const registryId = drone.getId();
                        const figureId = fila.uk_map_figura;

                        const consultaActualizar = `
                        UPDATE MapFiguraDron
                        SET pk_fk_map_registry_id = ?
                        WHERE uk_map_figura = ?`;

                        db.run(consultaActualizar, [registryId, figureId], (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(registryId);
                            }
                        });
                    } else {
                        reject(new Error('No hay filas con pk_fk_map_registry_id nulo en la tabla MapFiguraDron.'));
                    }
                }
            });
        });
    }

    static async removeFigure(): Promise<void> {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DatabaseSettings.dbPath);
            const deleteQuery = `DELETE FROM MapFiguraDron`;

            db.run(deleteQuery, [], (err) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    static async fillWithNewFigure(figureIds: Array<number>): Promise<void> {
        // TODO: Insertar row y column
        try {
            await MapFiguraDronTableImplementation.removeFigure();
            const db = new sqlite3.Database(DatabaseSettings.dbPath);

            const insertQuery = `INSERT INTO MapFiguraDron (uk_map_figura, pk_fk_map_registry_id) VALUES (?, NULL)`;
            for (const figureId of figureIds) {
                await new Promise((resolve, reject) => {
                    db.run(insertQuery, [figureId], (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(void 0);
                        }
                    });
                });
            }

            db.close();
        } catch (err) {
            throw err;
        }
    }
}
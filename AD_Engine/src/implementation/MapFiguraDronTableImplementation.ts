import {MapEntity} from "../model/MapEntity";
import {DronEntity} from "../model/DronEntity";
import sqlite3 from 'sqlite3';
import * as DatabaseSettings from "../settings/databaseSettings";
import { FigureEntity } from "../model/FigureEntity";
import { SquareEntity } from "../model/SquareEntity";


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

    static async storeFigure(figure: FigureEntity): Promise<void> {
        try {
            await MapFiguraDronTableImplementation.removeFigure();
            const db = new sqlite3.Database(DatabaseSettings.dbPath);

            const insertQuery = `
            INSERT INTO MapFiguraDron 
            (uk_map_figura, pk_fk_map_registry_id, row, column) 
            VALUES (?, NULL, ?, ?)`;
            for (let [squareHash, droneId] of figure.getFigure()) {
                const [row, column] = squareHash.split('-').map(Number);
                //console.log('Inserting figure: ', droneId, row, column, squareHash);
                await new Promise((resolve, reject) => {
                    db.run(insertQuery, [droneId, row, column], (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(void 0);
                        }
                    });
                });
            }
            console.log('Figure stored: ', figure.getName());

            db.close();
        } catch (err) {
            throw err;
        }
    }

    static async getSquareFromDrone(drone: DronEntity): Promise<SquareEntity> {
        try {
            const db = new sqlite3.Database(DatabaseSettings.dbPath);
            let square: SquareEntity = null;
            return await new Promise<SquareEntity>((resolve, reject) => {

            const insertQuery = `
                SELECT row, column 
                FROM MapFiguraDron 
                WHERE pk_fk_map_registry_id = ?`,
                droneId = drone.getId();

                db.get(insertQuery, [droneId], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (row) {
                            const square = new SquareEntity(row["row"], row["column"]);
                            resolve(square);
                        } else {
                            reject(new Error(`No se ha encontrado el dron con id ${droneId} en la tabla MapFiguraDron.`));
                        }
                    }
                });

                console.log('Drone square retrieved from db in getSquareFromDrone method: ', drone.getId(), square?.toString());
                db.close();
            });

  
        } catch (err) {
            throw err;
        }
    }

    static async getIdRegistry(square: SquareEntity, figureDroneId: number) {
        try {
            const db = new sqlite3.Database(DatabaseSettings.dbPath);
            let droneId: number = null;
            const query: string = `
                SELECT pk_fk_map_registry_id
                FROM MapFiguraDron
                WHERE row = ? AND column = ? AND uk_map_figura = ?`;

            return await new Promise<number>((resolve, reject) => {
                db.get(query, [square.getRow(), square.getColumn(), figureDroneId], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (row) {
                            droneId = row["pk_fk_map_registry_id"];
                            resolve(droneId);
                        } else {
                            reject(new Error(`No se ha encontrado el dron con id ${figureDroneId} en la tabla MapFiguraDron.`));
                        }
                    }
                })
            });
        } catch (err) {
            throw err;
        }
    }
}
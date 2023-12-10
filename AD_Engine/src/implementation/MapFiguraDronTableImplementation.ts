import {MapEntity} from "../model/MapEntity";
import {DronEntity} from "../model/DronEntity";
import sqlite3 from 'sqlite3';
import * as DatabaseSettings from "../settings/databaseSettings";
import { FigureEntity } from "../model/FigureEntity";
import { SquareEntity } from "../model/SquareEntity";
import {randomInt} from "crypto";
import * as fs from 'fs';


export async function appendLineToFile(filePath: string, line: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        resolve();
        fs.appendFile(filePath, `${line}\n`, 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}


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
                                appendLineToFile('error.log', `ERROR: Trying to mapNewDrone. ${err}, ${err.message}. DroneId: ${drone.getId()}, FigureId: ${figureId}`);
                                reject(err);
                            } else {
                                appendLineToFile('error.log', `NORMAL OK. DroneId: ${drone.getId()} FigureId: ${figureId}`);
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


    static async getRecoveredFigure(): Promise<FigureEntity> {
        try {
            //console.log("Removing id registry... from getRecoveredFigure method");
            //await MapFiguraDronTableImplementation.removeIdRegistry();


            const db = new sqlite3.Database(DatabaseSettings.dbPath);
            const query: string = `
                SELECT uk_map_figura, row, column, pk_fk_map_registry_id
                FROM MapFiguraDron
                WHERE pk_fk_map_registry_id IS NOT NULL`;

            const rows = await new Promise<any[]>((resolve, reject) => {
                db.all(query, [], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });

            const recoveredFigure = new FigureEntity("RecoveredFigure");

            rows.forEach((row) => {
                const square = new SquareEntity(row.row, row.column);
                const droneId = row.pk_fk_map_registry_id;
                recoveredFigure.addSquare(square, droneId);
            });

            db.close();
            return recoveredFigure;
        } catch (err) {
            throw err;
        }
    }

    static async getRecoveredDrones(): Promise<Array<DronEntity>> {
        try {
            const db = new sqlite3.Database(DatabaseSettings.dbPath);
            const query: string = `
                SELECT pk_fk_map_registry_id, row, column
                FROM MapFiguraDron
                WHERE pk_fk_map_registry_id IS NOT NULL`;

            const rows = await new Promise<any[]>((resolve, reject) => {
                db.all(query, [], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });

            });

            const recoveredDrones: DronEntity[] = [];
            rows.forEach((row) => {
                const drone = new DronEntity(row.pk_fk_map_registry_id);
                const square = new SquareEntity(row.row, row.column);
                drone.setTarget(square);
                recoveredDrones.push(drone);
            });

            db.close()
            return recoveredDrones;
        } catch (err) {
            throw err;
        }
    }


    static async forceMapNewDrone(registeredDrone: DronEntity, squareEntity: SquareEntity): Promise<void> {
        let db = null;
        try {
            db = new sqlite3.Database(DatabaseSettings.dbPath);

            // Eliminar el dron de la tabla MapFiguraDron, si existe
            const queryDeleteDrone = `
                DELETE FROM MapFiguraDron
                WHERE pk_fk_map_registry_id = ?
            `;
            await new Promise<void>((resolve, reject) => {
                db.run(queryDeleteDrone, [registeredDrone.getId()], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            // Obtener el número máximo de uk_map_figura
            const queryCountRows = `
            SELECT COUNT(*) AS count
            FROM MapFiguraDron
            `;
            const countRows = await new Promise<number>((resolve, reject) => {
                db.get(queryCountRows, [], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row.count);
                    }
                });
            });


            /**
             * MUCHO OJO: Se genera un número aleatorio para la figura. Cuando se usa el SIZE+1 en algunos casos
             * se genera un número que ya existe en la tabla MapFiguraDron.
             *
             * Es extremadamente raro que se repita el max_uk_map_figura, pero puede pasar.
             *
             * Si pasa, simplemente se quedará un dron muerto en el mapa durante una sola figura. Al pasar a la
             * siguiente figura, se volverá a generar un número aleatorio y se asignará a la nueva figura.
             *
             */
            //const max_uk_map_figura: number = countRows + 1 || randomInt(1000, 99999); // si no hay figura, se genera un número aleatorio
            const max_uk_map_figura: number = randomInt(1000, 99999); // si no hay figura, se genera un número aleatorio

            // Insertar el dron en la tabla MapFiguraDron
            const queryInsert = `
            INSERT INTO MapFiguraDron
            (pk_fk_map_registry_id, uk_map_figura, row, column)
            VALUES (?, ?, ?, ?)
        `;

            await new Promise<void>((resolve, reject) => {
                db.run(queryInsert, [
                    registeredDrone.getId(),
                    max_uk_map_figura,
                    squareEntity.getRow(),
                    squareEntity.getColumn(),
                ], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            // Cerrar la conexión a la base de datos después de la operación
            db.close();
            await appendLineToFile('error.log', `FORCE OK. DroneId: ${registeredDrone.getId()} Square: ${squareEntity.getHash()}, FigureId: ${max_uk_map_figura}, Size: ${countRows}`);

        } catch (err) {
            console.error(`ERROR: Trying to forceMapNewDrone. ${err}. DroneId: ${registeredDrone.getId()}`);
            await appendLineToFile('error.log', `ERROR: Trying to forceMapNewDrone. ${err}, ${err.message}. DroneId: ${registeredDrone.getId()}, Square: ${squareEntity.getHash()},`);
            if (db && db.open) {
                db.close();
            }
            throw err;
        }
    }


}
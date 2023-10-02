import sqlite3 from "sqlite3";

import { dbPath } from "./setDb";
import { SquareEntity } from "../model/SquareEntity";

export async function deleteDrone(square: SquareEntity, id: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const db = null;
        try {
            const db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', dbPath, err.message);
                    reject(err);
                    return;
                }
                console.log('Connected to the SQLite database:', dbPath);
            });

            const row: number = square.getRow();
            const column: number = square.getColumn();
            const dronId: string = id;
            // TODO: Encriptar id

            db.run(
                `
                DELETE FROM current
                WHERE pk_fk_current_registry_id = $dronId
                `,
                {
                    $dronId: dronId
                },
                function (err) {
                    if (err) {
                        console.error('Error inserting data:', err.message);
                        reject(err);
                        return;
                    }
                    console.log(`A row has been deleted with rowid ${this.lastID}`);
                }
            )

            db.close((err) => {
                if (err) {
                    console.error('Error closing database: ', err.message);
                    reject(false);
                }
                else {
                    console.log('Close the database connection.');
                    resolve(true);
                }
            });

        } 
        catch (err) {
            console.error('Error:', err.message);
            reject(false);
        }
    });
}

export async function createDrone(square: SquareEntity, id: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const db = null;
        try {
            const db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', dbPath, err.message);
                    reject(err);
                    return;
                }
                console.log('Connected to the SQLite database:', dbPath);
            });

            const row: number = square.getRow();
            const column: number = square.getColumn();
            const dronId: string = id;

            db.run(
                `
                INSERT INTO current
                    (pk_fk_current_registry_id, current_row, current_column)
                VALUES
                    ($dronId, $row, $column)
                `,
                {
                    $dronId: dronId,
                    $row: row,
                    $column: column
                },
                function (err) {
                    if (err) {
                        console.error('Error inserting data:', err.message);
                        reject(err);
                        return;
                    }
                    console.log(`A row has been inserted with rowid ${this.lastID}`);
                }
            )

            db.close((err) => {
                if (err) {
                    console.error('Error closing database: ', err.message);
                    reject(false);
                }
                else {
                    console.log('Close the database connection.');
                    resolve(true);
                }
            });

        }
        catch (err) {
            console.error('Error:', err.message);
            reject(false);
        }
    });
}
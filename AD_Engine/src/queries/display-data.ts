import { resolve } from "path";
import sqlite3 from "sqlite3";

const databaseName: string = process.env.DATABASE_NAME ?? '../AD_DronesBD/database.db';
console.log('!!!!!!!databaseName: ', databaseName)

export async function displayData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const db = new sqlite3.Database(databaseName, (err) => {
            if (err) {
                console.error('Error opening database:', databaseName, err.message);
                reject(err);
                return;
            }
            console.log('Connected to the SQLite database:', databaseName);
        
            try {
        
                // Mostrar datos de la tabla registry
                db.all('SELECT * FROM registry', [], (err, rows) => {
                    if (err) {
                        throw err;
                    }
                    console.log('Data from registry table:');
                    console.log("Show row per row: ")
                    rows.forEach((row) => {
                        //console.log(`ID: ${row.pk_registry_id}, Alias: ${row.registry_alias}`);
                    });
                    console.log("Show as JSON: /n: ", JSON.stringify(rows, null, 2))
                });
        
                // Mostrar datos de la tabla current
                db.all('SELECT * FROM current', [], (err, rows) => {
                    if (err) {
                        throw err;
                    }
                    console.log('Data from current table:');
                    console.log("Show row per row: ")
                    rows.forEach((row) => {
                        //console.log(`Registry ID: ${row.pk_fk_current_registry_id}, Row: ${row.current_row}, Column: ${row.current_column}`);
                    });
                    console.log("Show as JSON: /n: ", JSON.stringify(rows, null, 2))
                });
            }
            catch (err) {
                console.error('Error:', err.message);
                reject();
            }
        
        
            db.close((err) => {
                if (err) {
                    console.error('Error closing database: ', err.message);
                }
                else {
                    console.log('Close the database connection.');
                }
            });

            resolve();
        });
    });
    
}
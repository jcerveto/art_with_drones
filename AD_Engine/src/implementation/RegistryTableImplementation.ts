import * as sqlite3 from 'sqlite3';
import * as DatabaseSettings from "../settings/databaseSettings"

export class RegistryTableImplementation {
    public static async dronIdMatchesWithToken(dronId: number, token: string): Promise<boolean> {
        const dbPath = DatabaseSettings.dbPath;
        console.log("dbPath: ", dbPath, "dronId: ", dronId, "token: ", token);
        const db = new sqlite3.Database(dbPath);

        let result = false;

        interface RowResult {
            count: number;
        }

        const query = `
            SELECT COUNT(*) as count
            FROM Registry
            WHERE pk_registry_id = ? AND token = ?`;

        try {
            const row: RowResult = await new Promise((resolve, reject) => {
                db.get(query, [dronId, token], (err, row: RowResult) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            result = row && row.count > 0; // [0] -> La primera columna es el count

        } catch (err) {
            console.error('ERROR in RegistryTableImplementation: ', err.message);
        } finally {
            db.close((closeErr) => {
                if (closeErr) {
                    console.error('Error closing the database connection: ', closeErr.message);
                }
            });
        }

        return result;
    }
}

import * as sqlite3 from 'sqlite3';

export class RegistryTableImplementation {
    public static dronIdMatchesWithToken(dronId: number, token: string): boolean {
        const dbPath = 'db/database.db';
        const db = new sqlite3.Database(dbPath);

        let result = false;

        const query = `
            SELECT COUNT(*) as count 
            FROM Registry 
            WHERE pk_registry_id = ? AND token = ?`;

        try {
            db.get(query, [dronId, token], (err, row) => {
                if (err) {
                    console.error('ERROR in RegistryTableImplementation: ', err.message);
                } else {
                    if (row && row["count"] > 0) {
                        result = true;
                    }
                }
            });
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

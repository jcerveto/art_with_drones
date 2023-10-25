const sqlite3 = require('sqlite3').verbose();
const databaseName = process.env.DATABASE_NAME || 'database.db';

const fakeDronesIds = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
const fakeFiguresDronesIds=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const fakeRows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const fakeColumns = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

const db = new sqlite3.Database(databaseName, (err) => {
    if (err) {
        console.error('Error opening database:', databaseName, err.message);
        return;
    }
    console.log('Connected to the SQLite database:', databaseName);

    try {
        // Insert 10 drones into the registry table
        for (let i = 1; i <= fakeDronesIds.length; i++) {
            const registryAlias = `Drone ${i}`;
            const token = `token-${i}`;
            db.run(`
                INSERT INTO 
                Registry 
                    (pk_registry_id, alias, token) 
                    VALUES (?, ?, ?)`
                , [fakeDronesIds[i], registryAlias, token], function(err) {
                if (err) {
                    return console.error('Error inserting drone into Registry:', err.message);
                }
                console.log(`Inserted drone "${registryAlias}" into registry with ID: ${this.lastID}`);
            });
        }

        // Insert 5 drones into the map table
        for (let i = 0; i < fakeDronesIds.length / 2; i++) {
            const mapFigura = fakeFiguresDronesIds[i];
            const row = fakeRows[i];
            const column = fakeColumns[i];
            db.run(`
                INSERT INTO
                MapFiguraDron
                    (pk_fk_map_registry_id, uk_map_figura, row, column) 
                VALUES (?, ?, ?, ?)`
                , [null, mapFigura, row, column], function (err) {
                    if (err) {
                        return console.error('Error inserting drone into map:', err.message);
                    }
                    console.log(`Inserted drone with Registry ID ${i} into map table.`);
                });
        }

    }
    catch (err) {
        console.error('Error:', err.message);
    }

    db.close((err) => {
        if (err) {
            console.error('Error closing database: ', err.message);
        } else {
            console.log('Close the database connection.');
        }
    });
});

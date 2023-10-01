const sqlite3 = require('sqlite3').verbose();
const databaseName = process.env.DATABASE_NAME || 'database.db';

const db = new sqlite3.Database(databaseName, (err) => {
    if (err) {
        console.error('Error opening database:', databaseName, err.message);
        return;
    }
    console.log('Connected to the SQLite database:', databaseName);

    try {
        // Insert 10 drones into the registry table
        for (let i = 1; i <= 10; i++) {
            const registryAlias = `Drone ${i}`;
            db.run(`INSERT INTO registry (registry_alias) VALUES (?)`, [registryAlias], function(err) {
                if (err) {
                    return console.error('Error inserting drone into registry:', err.message);
                }
                console.log(`Inserted drone "${registryAlias}" into registry with ID: ${this.lastID}`);
            });
        }

        // Insert 5 drones into the current table (assuming registry IDs start from 1)
        for (let i = 1; i <= 5; i++) {
            const currentRow = i;
            const currentColumn = i;
            db.run(`INSERT INTO current (pk_fk_current_registry_id, current_row, current_column) VALUES (?, ?, ?)`, [i, currentRow, currentColumn], function(err) {
                if (err) {
                    return console.error('Error inserting drone into current:', err.message);
                }
                console.log(`Inserted drone with Registry ID ${i} into current table.`);
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

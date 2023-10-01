const sqlite3 = require('sqlite3').verbose();

const databaseName = process.env.DATABASE_NAME || 'database.db';

const db = new sqlite3.Database(databaseName, (err) => {
    if (err) {
        console.error('Error opening database:', databaseName, err.message);
        return;
    }
    console.log('Connected to the SQLite database:', databaseName);

    try {
        // create table registry
        db.run(`CREATE TABLE IF NOT EXISTS registry (
            pk_registry_id INTEGER 
                PRIMARY KEY AUTOINCREMENT,
            registry_alias TEXT NOT NULL
        )`);
        console.log('Created table registry');
        
        // create table current
        db.run(`CREATE TABLE IF NOT EXISTS current (
            pk_fk_current_registry_id INTEGER
                PRIMARY KEY 
                REFERENCES registry (pk_registry_id),
            current_row INTEGER 
                NOT NULL,
            current_column INTEGER 
                NOT NULL
        )`);

    }
    catch (err) {
        console.error('Error creating tables:', err.message);
    }

    db.close((err) => {
        if (err) {
            console.error('Error closing database: ', err.message);
        }
        else {
            console.log('Close the database connection.');
        }
    });
});

module.exports = db;

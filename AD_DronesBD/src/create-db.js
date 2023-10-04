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
        db.run(`CREATE TABLE IF NOT EXISTS Registry (
            pk_registry_id INTEGER PRIMARY KEY,
            alias TEXT NOT NULL,
            token TEXT NOT NULL
        )`);
        console.log('Created table Registry');
        
        // create table current
        db.run(`CREATE TABLE IF NOT EXISTS Current (
            pk_fk_current_registry_id INTEGER,
            row INTEGER NOT NULL,
            column INTEGER NOT NULL,
            isActive BOOLEAN NOT NULL,
            FOREIGN KEY (pk_fk_current_registry_id) REFERENCES Registry(pk_registry_id)
        )`);
        console.log('Created table Current');

        // create table MapFiguraDron
        db.run(`CREATE TABLE IF NOT EXISTS MapFiguraDron (
            pk_fk_map_registry_id INTEGER,
            uk_map_figura INTEGER UNIQUE,
            FOREIGN KEY (pk_fk_map_registry_id) REFERENCES Registry(pk_registry_id)
        )`);
        console.log('Created table MapFiguraDron');
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

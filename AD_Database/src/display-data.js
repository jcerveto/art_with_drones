const sqlite3 = require('sqlite3').verbose();

const databaseName = process.env.DATABASE_NAME || 'database.db';

const db = new sqlite3.Database(databaseName, (err) => {
    if (err) {
        console.error('Error opening database:', databaseName, err.message);
        return;
    }
    console.log('Connected to the SQLite database:', databaseName);

    try {
        // Mostrar datos de la tabla MapFiguraDron
        db.all('SELECT * FROM MapFiguraDron', [], (err, rows) => {
            if (err) {
                throw err;
            }
            console.log('Data from MapFiguraDron table:');
            console.log("Show row per row: ")
            console.log("Show as JSON: /n: ", JSON.stringify(rows, null, 2))
            console.log("============================================")
        });

        // Mostrar datos de la tabla Registry
        db.all('SELECT * FROM Registry', [], (err, rows) => {
            if (err) {
                throw err;
            }
            console.log('Data from Registry table:');
            console.log("Show row per row: ")
            console.log("Show as JSON: /n: ", JSON.stringify(rows, null, 2))
            console.log("============================================")
        });
    }
    catch (err) {
        console.error('Error:', err.message);
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

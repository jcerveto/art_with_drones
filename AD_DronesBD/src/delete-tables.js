const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');

const databaseName = process.env.DATABASE_NAME || 'database.db';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const db = new sqlite3.Database(databaseName, (err) => {
    if (err) {
        console.error('Error opening database:', databaseName, err.message);
        return;
    }
    console.log('Connected to the SQLite database:', databaseName);

    rl.question('Are you sure you want to empty all tables? (yes/no): ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
            // Vaciar todas las tablas
            db.serialize(() => {
                db.run('DELETE FROM Registry');
                console.log('Registry table has been emptied.');
                db.run('DELETE FROM Current');
                console.log('Current table has been emptied.');
                db.run('DELETE FROM MapFiguraDron');
                console.log('MapFiguraDron table has been emptied.');
            });
            console.log('All tables have been emptied.');
        } else {
            console.log('Operation cancelled. No data was removed.');
        }

        rl.close();

        db.close((err) => {
            if (err) {
                console.error('Error closing database: ', err.message);
            } else {
                console.log('Close the database connection.');
            }
        });
    });
});

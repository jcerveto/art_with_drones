const db = require('./database');

function insertUser(username, email) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO users (username, email) VALUES (?, ?)', [username, email], function (err) {
      if (err) {
        reject(err.message);
      } else {
        resolve(`A new user has been added with ID: ${this.lastID}`);
      }
    });
  });
}

function readAllUsers() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(rows);
        }
      });
    });
}

function cleanUsers() {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users', [], (err, rows) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(rows);
        }
      });
    });
}

module.exports = {
  insertUser,
    readAllUsers,
    cleanUsers
};

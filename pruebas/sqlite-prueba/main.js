const { insertUser, readAllUsers, cleanUsers } = require('./users');

// Llamada a la función para insertar un usuario
insertUser('usuario1', 'usuario1@example.com')
  .then((message) => {
    console.log(message);
  })
  .catch((error) => {
    console.error(error);
  });


readAllUsers()
    .then((rows) => {
        console.log("Users", rows);
    }
    )
    .catch((error) => {
        console.error(error);
    });

cleanUsers()
    .then((rows) => {
        console.log("Users removed: ", rows);
    }
    )
    .catch((error) => {
        console.error(error);
    });

readAllUsers()
    .then((rows) => {
        console.log("Users", rows);
    }
    )
    .catch((error) => {
        console.error(error);
    });
import sqlite3

import src.setEnviromentVariables as env
import src.drone.droneEntity


def connect_to_database() -> tuple:
    """
    Función para conectarse a la base de datos.
    :return: conexión y cursor
    """
    try:
        database_name = env.get_database_file()
        connection = sqlite3.connect(database_name)
        cursor = connection.cursor()
        return connection, cursor
    except sqlite3.Error as error:
        print("Error al conectar a la base de datos:", error)
        return None, None


def close_connection(connection) -> None:
    """
    Función para cerrar la conexión con la base de datos.
    :param connection: conexión a la base de datos
    :return: None
    """
    if connection:
        connection.close()


def get_all_drones() -> list:
    try:
        drones = []
        connection, cursor = connect_to_database()
        if connection and cursor:
            cursor.execute("SELECT * FROM Registry")
            rows = cursor.fetchall()
            for row in rows:
                new_drone = droneEntity.DroneEntity(id=row[0], alias=row[1], token=row[2])
                drones.append(new_drone)
                print(f"Drone: {new_drone.id}, {new_drone.alias}, {new_drone.token}")
            
            return rows
    except sqlite3.Error as error:
        print("Error al obtener datos:", error)
        return []
    finally:
        close_connection(connection)


def add_drone(drone) -> str:
    """

    :param drone: droneEntity.DroneEntity
    :return:
    """
    status = True
    try:
        connection, cursor = connect_to_database()
        if connection and cursor:
            cursor.execute("INSERT INTO Registry (pk_registry_id, alias, token) VALUES (?, ?, ?)", (int(drone.id), drone.alias, drone.token))
            connection.commit()
            print(f"Fila insertada correctamente: [{drone.id}, {drone.alias}, {drone.token}] ")
    except sqlite3.Error as error:
        print("Error al insertar datos:", error)
        status = False
    finally:
        close_connection(connection)
        if status:
            return drone.token
        else:
            return ''

def update_drone(new_drone) -> None:
    """

    :param new_drone: droneEntity.DroneEntity
    :return:
    """
    try:
        connection, cursor = connect_to_database()
        if connection and cursor:
            cursor.execute("UPDATE Registry SET alias = ?, token = ? WHERE pk_registry_id = ?", (new_drone.alias, new_drone.token, new_drone.id))
            connection.commit()
            print(f"Fila editada correctamente: [{new_drone.id}, {new_drone.alias}, {new_drone.token}] ")
    except sqlite3.Error as error:
        print("Error al editar datos:", error)
    finally:
        close_connection(connection)


def delete_drone(droneId: int):
    try:
        connection, cursor = connect_to_database()
        if connection and cursor:
            cursor.execute("DELETE FROM Registry WHERE pk_registry_id = ?", (int(droneId),))
            connection.commit()
            print(f"Fila eliminada correctamente. [{droneId}]")
    except sqlite3.Error as error:
        print("Error al eliminar datos:", error)
    finally:
        close_connection(connection)


if __name__ == '__main__':
    print("Prueba de la base de datos...")
    connect_to_database()
    d88 = droneEntity.DroneEntity(88, "Drone88", "token-88")
    add_drone(d88)
    d88.alias = "Drone88-2"
    update_drone(d88)
    delete_drone(d88.id)
    get_all_drones()

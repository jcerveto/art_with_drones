import json
from .drone import droneEntity as drone


class Persistence:
    def __init__(self, filename):
        self.filename = filename

    def get_all_drones(self) -> list:
        drones = []

        try:
            with open(self.filename, 'r') as file:
                drones_data = json.load(file)
                for drone_data in drones_data:
                    new_drone = drone.DroneEntity(id=drone_data['id'], alias=drone_data['alias'])
                    drones.append(new_drone)
        except Exception as e:
            print(f"Error reading JSON file: {e}")
            return []

        return drones

    def read_drone(self, drone_to_send: object) -> bool:
        """
        Get drone by id.
        Change drone instance attributes.
        :param drone_to_send:
        :return: Returns true if the drone exists, false otherwise.
        """

        try:
            with open(self.filename, 'r') as file:
                drones_data = json.load(file)
                drone_id_str = str(drone_to_send.id)  # Convertir el ID a cadena
                if drone_id_str in drones_data:
                    drone_info = drones_data[drone_id_str][0]
                    new_drone = drone.DroneEntity(id=drone_info['id'], alias=drone_info['alias'])
                    drone_to_send.id = new_drone.id
                    drone_to_send.alias = new_drone.alias
                else:
                    print(f"Drone with ID {drone_to_send.id} not found.")
                    return False
        except Exception as e:
            print(f"Error reading JSON file: {e}")
            return False

        return True

    def add_drone(self, new_drone) -> bool:
        drones_data = []

        if self.exists_drone(new_drone):
            return False  # No se crea

        try:
            with open(self.filename, 'r') as file:
                drones_data = json.load(file)

            drones_data[f"{str(new_drone.id)}"] = [{'id': new_drone.id, 'alias': new_drone.alias}]

            with open(self.filename, 'w') as file:
                json.dump(drones_data, file, indent=4)
        except Exception as e:
            print(f"Error writing JSON file: {e}")
            return False

        return True

    def update_drone(self, updated_drone) -> bool:
        drones_data = []

        if not self.exists_drone(updated_drone):
            return False    # No se actualiza

        try:
            with open(self.filename, 'r') as file:
                drones_data = json.load(file)

            updated_drone_data = {'id': updated_drone.id, 'alias': updated_drone.alias}
            drones_data[f"{str(updated_drone.id)}"] = [updated_drone_data]

            with open(self.filename, 'w') as file:
                json.dump(drones_data, file, indent=4)
        except Exception as e:
            print(f"Error updating JSON file: {e}")
            return False

        return True

    def delete_drone(self, drone_to_delete) -> bool:
        if not self.exists_drone(drone_to_delete):
            return False

        try:
            with open(self.filename, 'r') as file:
                drones_data = json.load(file)
            print("hola1")

            # Crear una nueva versión de drones_data sin el dron a eliminar
            new_drones_data = {key: value for key, value in drones_data.items() if key != str(drone_to_delete.id)}

            with open(self.filename, 'w') as file:
                json.dump(new_drones_data, file, indent=4)
        except Exception as e:
            print(f"Error deleting JSON file: {e}")
            return False

        return True

    def exists_drone(self, drone_obj) -> bool:
        try:
            with open(self.filename, 'r') as file:
                drones_data = json.load(file)
                return drone_obj.id in drones_data

        except Exception as e:
            print(f"Error reading JSON file: {e}")
            return False

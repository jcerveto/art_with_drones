import csv
from .drone import droneEntity as drone


class Persistence:
    def __init__(self, filename):
        self.filename = filename

    def get_all_drones(self) -> list:
        drones = []

        try:
            with open(self.filename, 'r') as file:
                reader = csv.reader(file)
                for row in reader:
                    if len(row) >= 2:
                        new_drone = drone.DroneEntity(id=row[0], alias=row[1])
                        drones.append(new_drone)
                    else:
                        print(f"Skipping invalid data: {row}")
        except Exception as e:
            print(f"Error reading CSV file: {e}")
            return []

        return drones

    def get_drone_by_id(self, id: str):
        new_drone: drone.DroneEntity = None

        try:
            with open(self.filename, 'r') as file:
                reader = csv.reader(file)
                for row in reader:
                    if len(row) >= 2:
                        if row[0] == id:
                            new_drone = drone.DroneEntity(id=row[0], alias=row[1])
                            break
                    else:
                        print(f"Skipping invalid data: {row}")
        except Exception as e:
            print(f"Error reading CSV file: {e}")
            return None

        return new_drone

    def add_drone(self, new_drone) -> bool:
        if self.exists_drone(new_drone):
            return False # No se crea

        # se crea
        try:
            with open(self.filename, 'a') as file:
                writer = csv.writer(file)
                writer.writerow([new_drone.id, new_drone.alias])
        except Exception as e:
            print(f"Error writing CSV file: {e}")
            return False

        return True

    def update_drone(self, updated_drone) -> bool:
        rows = []

        try:
            with open(self.filename, 'r+') as file:
                reader = csv.reader(file)
                for row in reader:
                    if len(row) >= 2:
                        if row[0] == updated_drone.id:
                            rows.append([updated_drone.id, updated_drone.alias])
                        else:
                            rows.append(row)
                    else:
                        print(f"Skipping invalid data: {row}")

                # Volvemos al inicio del archivo y escribimos las filas actualizadas
                file.seek(0)
                writer = csv.writer(file)
                writer.writerows(rows)
                file.truncate()  # Truncamos el archivo si las nuevas filas son más cortas

        except Exception as e:
            print(f"Error updating CSV file: {e}")
            return False

        return True

    def delete_drone(self, drone_to_delete) -> bool:
        if not self.exists_drone(drone_to_delete):
            return False

        rows = []
        try:
            with open(self.filename, 'r+') as file:
                reader = csv.reader(file)
                for row in reader:
                    if len(row) >= 2:
                        if row[0] == drone_to_delete.id:
                            continue
                        else:
                            rows.append(row)
                    else:
                        print(f"Skipping invalid data: {row}")

            # Volvemos al inicio del archivo y escribimos las filas actualizadas
            with open(self.filename, 'w', newline='') as file:
                writer = csv.writer(file)
                writer.writerows(rows)

        except Exception as e:
            print(f"Error deleting CSV file: {e}")
            return False

        return True

    def exists_drone(self, drone_obj) -> bool:
        try:
            with open(self.filename, 'r') as file:
                reader = csv.reader(file)
                for row in reader:
                    if len(row) >= 2:
                        if row[0] == drone_obj.id:
                            return True
                    else:
                        print(f"Skipping invalid data: {row}")

        except Exception as e:
            print(f"Error reading CSV file: {e}")
            return False
        return  False




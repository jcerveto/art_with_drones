from .. import persistence


class DroneImplementation:
    filename: str = r"data/db.json"  # Se calcula la ruta relativa desde el directorio raíz (main.py)

    def __init__(self, id: str, alias: str):
        self.id = id
        self.alias = alias
        self.db = persistence.Persistence(DroneImplementation.filename)
        from os import getcwd

    def create(self):
        try:
            return self.db.add_drone(self)
        except Exception as e:
            print(f"Error creating drone: {e}")
            return False

    def read(self):
        try:
            return self.db.read_drone(self)
        except Exception as e:
            print(f"Error reading drone: {e}")
            return False

    def update(self):
        try:
            return self.db.update_drone(self)
        except Exception as e:
            print(f"Error updating drone: {e}")
            return False

    def delete(self):
        try:
            return self.db.delete_drone(self)
        except Exception as e:
            print(f"Error deleting drone: {e}")
            return False

    def __str__(self):
        return f" [id: {self.id}, alias: {self.alias}]"

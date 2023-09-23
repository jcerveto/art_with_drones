from .. import persistence


class DroneImplementation:
    filename: str = r"../../data/db.json"
    filenameWindows = "..\\..\\data\\db.json"

    def __init__(self, id: str, alias: str):
        self.id = id
        self.alias = alias
        self.db = persistence.Persistence(DroneImplementation.filename)

    def create(self):
        try:
            print(f"Creating drone: {str(self)}")
            return self.db.add_drone(self)
        except Exception as e:
            print(f"Error creating drone: {e}")
            return False

    def read(self):
        try:
            print(f"Reading drone: {str(self)}")
            return self.db.get_drone_by_id(self.id)
        except Exception as e:
            print(f"Error reading drone: {e}")
            return False

    def update(self):
        try:
            print(f"Updating drone: {str(self)}")
            return self.db.update_drone(self)
        except Exception as e:
            print(f"Error updating drone: {e}")
            return False

    def delete(self):
        try:
            print(f"Deleting drone: {str(self)}")
            return self.db.delete_drone(self)
        except Exception as e:
            print(f"Error deleting drone: {e}")
            return False

    def __str__(self):
        return f" [id: {self.id}, alias: {self.alias}]"

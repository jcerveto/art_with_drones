from .. import security
from .. import persistence as db


class DroneImplementation:
    def __init__(self, id: str, alias: str):
        self.id = id
        self.alias = alias
        from os import getcwd

    def create(self):
        try:
            return db.add_drone(self)
        except Exception as e:
            print(f"Error creating drone: {e}")
            return False

    def read(self):
        try:
            return db.read_drone(self)
        except Exception as e:
            print(f"Error reading drone: {e}")
            return False

    def update(self):
        try:
            return db.update_drone(self)
        except Exception as e:
            print(f"Error updating drone: {e}")
            return False

    def delete(self):
        try:
            return db.delete_drone(self)
        except Exception as e:
            print(f"Error deleting drone: {e}")
            return False

    @staticmethod
    def generate_token():
        try:
            return security.generate_new_token()
        except Exception as e:
            print(f"Error generating token for drone: {e}")

    def __str__(self):
        return f" [id: {self.id}, alias: {self.alias}]"

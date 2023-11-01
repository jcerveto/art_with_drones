import src.drone.droneImplementation as impl


class DroneEntity:
    def __init__(self, id: int, alias: str, token=None):
        self.id = int(id)
        self.alias = alias
        if token is None:
            self.token = None
            self.token = self.get_new_token()
        else:
            self.token = token

    def create(self) -> str:
        try:
            return impl.create(self)
        except Exception as e:
            print(f"Error creating drone: {e}")
            return ''

    def update(self) -> bool:
        try:
            print(f"Updating drone: {str(self)}")
            impl.update(self)
            return True
        except Exception as e:
            print(f"Error updating drone: {e}")
            return False

    def delete(self) -> bool:
        try:
            print(f"Deleting drone: {str(self)}")
            return impl.delete(self.id)
        except Exception as e:
            print(f"Error deleting drone: {e}")
            return False

    def get_new_token(self) -> str:
        try:
            print(f"Generating token for drone: {str(self)}")
            return impl.generate_token()
        except Exception as e:
            print(f"Error generating token for drone. Entity layer: {e}")

    def __str__(self):
        return f"[{self.id}, {self.alias}, {self.token}]"

    def __repr__(self):
        return f"[id={self.id}, alias={self.alias}, token={self.token}"

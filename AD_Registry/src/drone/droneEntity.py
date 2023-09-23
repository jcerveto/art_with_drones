from . import droneImplementation


class DroneEntity:
    def __init__(self, id: str, alias: str):
        '''
        Constructor. Entity Layer
        :param id:
        :param alias:
        :return:
        '''
        print("Beiginning of the constructor. ")
        self.id = id
        self.alias = alias
        self.drone = droneImplementation.DroneImplementation(self.id, self.alias)
        print("End of the constructor")

    def create(self) -> bool:
        try:
            print(f"Creating drone: {str(self)}")
            return self.drone.create()
        except Exception as e:
            print(f"Error creating drone: {e}")
            return False

    def read(self) -> bool:
        try:
            print(f"Reading drone: {str(self)}")
            return self.drone.read()
        except Exception as e:
            print(f"Error reading drone: {e}")
            return False

    def update(self) -> bool:
        try:
            print(f"Updating drone: {str(self)}")
            return self.drone.update()
        except Exception as e:
            print(f"Error updating drone: {e}")
            return False

    def delete(self) -> bool:
        try:
            print(f"Deleting drone: {str(self)}")
            return self.drone.delete()
        except Exception as e:
            print(f"Error deleting drone: {e}")
            return False

    def __str__(self):
        return str(self.drone)

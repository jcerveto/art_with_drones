import coordinateMovement

class DroneMovement:
    def __init__(self, id_drone, position: coordinateMovement.CoordinateMovement):
        self.id_drone = id_drone
        self.position = coordinateMovement.CoordinateMovement(position.row, position.col)


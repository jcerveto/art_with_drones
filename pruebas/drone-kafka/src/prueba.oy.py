import utils
import coordinateMovement
import droneMovement
import currentPositionProductor

start = coordinateMovement.CoordinateMovement(1, 1)
end = coordinateMovement.CoordinateMovement(20, 20)
path = utils.get_path_temp(start, end)
print(f"Path: {path}")
print(type(path))
for i in path:
    print(i)


drone = droneMovement.DroneMovement(10, 1, 1)
currentPositionProductor.publishCurrentPosition(drone, path)
print("Done")

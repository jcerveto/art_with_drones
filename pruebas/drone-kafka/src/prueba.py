import sys

import utils
import coordinateMovement
import droneMovement
import currentPositionProductor

def main(droneId: int, row: int, column: int):
    droneId = int(droneId)
    row = int(row)
    column = int(column)

    start = coordinateMovement.CoordinateMovement(1, 1)
    end = coordinateMovement.CoordinateMovement(row, column)
    path = utils.get_path_temp(start, end)
    print(f"Path: {path}")
    print(type(path))
    for i in path:
        print(i)


    drone = droneMovement.DroneMovement(droneId, 1, 1)
    currentPositionProductor.publishCurrentPosition(drone, path)
    print("Done")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python prueba.py <droneId> <row> <column>")
        sys.exit(-1)

    main(sys.argv[1], sys.argv[2], sys.argv[3])

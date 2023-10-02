import sys
import drone

if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise Exception("Not enough arguments")

    DRONE_LIST = []

    for i in range(int(sys.argv[1])):
       DRONE_LIST += [drone.Drone(len(DRONE_LIST), 0, 0)]

    for d in DRONE_LIST:
        d.move_to(1, 2)

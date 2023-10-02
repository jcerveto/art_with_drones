from drone import *
from client import *
from util import *

if __name__ == "__main__":
    drone = Drone(0, 0, 0)
    print(str(encode_data(drone)))
    drone.move_to(17, 13)
    print(str(encode_data(drone)))
    path = get_path(0, 0, 17, 13)
    print(f"Path followed: {path}")
    print(f"({len(path)} steps)")

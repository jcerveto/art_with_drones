import sys
import registry

if __name__ == '__main__':
    if len(sys.argv) != 4 and len(sys.argv) != 5:
        print(f"Usage: python main.py <function> <droneId> <alias> <token: optional>\
              \n\t{registry.valid_functions}")
        sys.exit(-1)

    if sys.argv[1] not in registry.valid_functions:
        print(f"Usage: <function> must be in: \
              \t{registry.valid_functions}")
        sys.exit(-1)

    drone_function = sys.argv[1]
    drone_object = None

    # create
    if len(sys.argv) == 4 and sys.argv[1] == "create":
        drone_object = registry.droneEntity.DroneEntity(
            drone_id=int(sys.argv[2]),
            alias=sys.argv[3]
        )
    # update, delete
    elif len(sys.argv) == 5 and (sys.argv[1] == "update" or sys.argv[1] == "delete"):
        drone_object = registry.droneEntity.DroneEntity(
            drone_id=int(sys.argv[2]),
            alias=sys.argv[3],
            token=sys.argv[4]
        )
    # error
    else:
        print(f"Error. Usage: python main.py <function> <droneId> <alias> <token: optional>\
              \n\t{registry.valid_functions}")
        sys.exit(-1)

    print(f"Starting {drone_function} function. Drone object: {drone_object}")
    registry.main(drone_object, drone_function)
    print(f"Finished {drone_function} function.")

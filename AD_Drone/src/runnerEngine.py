import sys
import csv

import engine
import setEnviromentVariables as env

def get_token(drone_id: int) -> str:
    """
    File structure:
    <droneId>,<alias>,<token>
    ...

    :param drone_id: int
    :return: str
    """
    drone_id = int(drone_id)
    with open(env.getDronesPath()) as file:
        reader = csv.reader(file, delimiter=",")
        for row in reader:
            if int(row[0]) == drone_id:
                return row[2]

    raise Exception("Drone with id=" + str(drone_id) + " not found in " + str(env.getDronesPath()))


if __name__ == '__main__':
    if len(sys.argv) not in [2, 3, 4]:
        print(f"Usage: python {sys.argv[0]} <droneId> <token: optional>")
        sys.exit(-1)

    drone_id = int(sys.argv[1])
    token = None
    show_map = False

    # Solo se recibe el id del drone
    if len(sys.argv) == 2:
        token = get_token(drone_id)
    # Se recibe:
    # 1) id del drone y el token
    # 2) id del drone y la opción de mostrar el mapa
    elif len(sys.argv) == 3:
        if sys.argv[2] == "--show_map" or sys.argv[2] == "-s":
            show_map = True

        # Se busca el token en el registro
        if show_map:
            token = get_token(drone_id)
        else:
            token = sys.argv[2]

    # Se recibe el id del drone, el token y la opción de mostrar el mapa
    elif len(sys.argv) == 4:
        token = sys.argv[2]
        if sys.argv[3] == "--show_map" or sys.argv[3] == "-s":
            show_map = True

    else:
        print(f"Error. Usage: python {sys.argv[0]} <droneId> <token: optional>")
        sys.exit(-1)

    drone = engine.droneEntity.DroneEntity(
        drone_id=drone_id,
        alias="alias_is_not_required",
        token=token)
    print(f"Starting drone={drone}")
    engine.main(drone, show_map=show_map)
import sys
import socket
import droneEntity
import json
import setEnviromentVariables as env
import csv
import requests

import security

valid_functions = ["create", "update", "delete"]


def store_drone(drone: droneEntity.DroneEntity) -> None:
    print(f"Storing drone: {drone} in {env.getDronesPath()}")
    with open(env.getDronesPath(), "a+", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([drone.drone_id, drone.alias, drone.token])
    print(f"Drone stored: {drone}")


def send_message(message: bytes, drone: droneEntity.DroneEntity, drone_action: str):
    try:
        response = requests.get(url, cert=env.getEngineCertificatePath(), verify=False)
        dict_response = json.loads(response.text)
        drone.temporalToken = dict_response["temp_token"]
        drone.personalKey = dict_response["personalKey"]
        drone.generalKey = dict_response["generalKey"]

        if not dict_response["ok"]:
            print(f"Error in {drone_action} action: {dict_response['message']}")
            sys.exit(-1)

        # it is ok
        if drone_action == "create":
            drone.token = dict_response["token"]
            print(f"Drone created. Token: {drone.token}")
            store_drone(drone)

        elif drone_action == "update":
            print(f"Drone updated. Token: {drone.token}")

        elif drone_action == "delete":
            print(f"Drone deleted.")

        else:
            print(f"Invalid action: {drone_action}")
            sys.exit(-1)

        s.close()
    except Exception as e:
        print(f"Error sending message. {e}. Closing process...")
        sys.exit(-1)


def get_message_to_send(drone: droneEntity.DroneEntity, drone_action: str) -> bytes:
    if drone_action not in valid_functions:
        raise ValueError(f"Invalid function: {drone_action}")

    # No requiere token
    if drone_action == "create":
        return json.dumps({
            "action": drone_action,
            "id_registry": drone.drone_id,
            "alias": drone.alias,
        }).encode(env.getEncoding())

    # Requiere token
    return json.dumps({
        "action": drone_action,
        "id_registry": drone.drone_id,
        "alias": drone.alias,
        "token": drone.token
    }).encode(env.getEncoding())


def main(drone: droneEntity.DroneEntity, drone_action: str):
    try:
        message = get_message_to_send(drone, drone_action)
        print(f"Message to send: {message}")
        send_message(message, drone, drone_action)


    except Exception as e:
        print(f"Error handling action drone: {e}")
        sys.exit(-1)


if __name__ == '__main__':
    if len(sys.argv) != 4 and len(sys.argv) != 5:
        print(f"Usage: python main.py <function> <droneId> <alias> <token: optional>\
              \n\t{valid_functions}")
        sys.exit(-1)

    if sys.argv[1] not in valid_functions:
        print(f"Usage: <function> must be in: \
              \t{valid_functions}")
        sys.exit(-1)

    drone_function = sys.argv[1]
    drone_object = None

    # create
    if len(sys.argv) == 4 and sys.argv[1] == "create":
        drone_object = droneEntity.DroneEntity(
            drone_id=int(sys.argv[2]),
            alias=sys.argv[3]
        )
    # update, delete
    elif len(sys.argv) == 5 and (sys.argv[1] == "update" or sys.argv[1] == "delete"):
        drone_object = droneEntity.DroneEntity(
            drone_id=int(sys.argv[2]),
            alias=sys.argv[3],
            token=sys.argv[4]
        )
    # error
    else:
        print(f"Error. Usage: python main.py <function> <droneId> <alias> <token: optional>\
              \n\t{valid_functions}")
        sys.exit(-1)

    print(f"Starting {drone_function} function. Drone object: {drone_object}")
    main(drone_object, drone_function)

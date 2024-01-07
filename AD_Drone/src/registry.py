import sys
import json
import csv
import requests
import os
from pprint import pprint

import security
import droneEntity
import setEnviromentVariables as env
import engineHttp


valid_functions = ["create", "update", "delete", "login"]


def store_drone(drone: droneEntity.DroneEntity) -> None:
    print(f"Storing drone: {drone} in {env.getDronesPath()}")
    with open(env.getDronesPath(), "a+", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([drone.drone_id, drone.alias, drone.token])
    print(f"Drone stored: {drone}")


def send_message(message: bytes, drone: droneEntity.DroneEntity):
    try:
        params = {
            "id": drone.drone_id,
            "password": drone.token,
        }

        url = f"https://{env.getRegistryHost()}:{env.getRegistryPortHttp()}/login"
        response = requests.get(url, params=params, verify=False)
        dict_response = json.loads(response.text)
        print(f"Response: {dict_response.get('message'), ''}")
        drone.temporal_token = dict_response["token"]
        drone.timestamp = dict_response["timestamp"]
        

        if not dict_response["ok"]:
            print(f"Error in login {dict_response['message']}")
            sys.exit(-1)


    except Exception as e:
        print(f"Error sending message. {e}. Closing process...")
        sys.exit(-1)


def get_message_to_send(drone: droneEntity.DroneEntity) -> bytes:

    # Requiere token
    return json.dumps({
        "action": "login",
        "id_registry": drone.drone_id,
        "alias": drone.alias,
        "token": drone.token
    }).encode(env.getEncoding())

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


def main(drone: droneEntity.DroneEntity):
    try:
        message = get_message_to_send(drone)
        print(f"Message to send: {message}")
        send_message(message, drone)
        print("END")


    except Exception as e:
        print(f"Error handling action drone: {e}")
        sys.exit(-1)


if __name__ == '__main__':
    if len(sys.argv) not in [2, 3]:
        print(f"Usage: python {sys.argv[0]} <droneId> <-s or --show_map: optional>")
        sys.exit(-1)

    show_map = len(sys.argv) == 3 and (sys.argv[2] == "--show_map" or sys.argv[2] == "-s")

    print(f"PID: {os.getpid()}")

    drone_id = int(sys.argv[1])
    password = get_token(drone_id)
    drone_object = droneEntity.DroneEntity(
        drone_id=drone_id,
        alias=f"not_required_{drone_id}",
        token=password,
    )

    print(f"Starting login function. Drone object: {drone_object}")
    main(drone_object)
    print(f"Finished login function.", pprint(vars(drone_object)))
    print("Starting engine...")
    engineHttp.main(drone_object, show_map)
    print("Engine finished.")



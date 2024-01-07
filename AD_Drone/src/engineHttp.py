import requests
import json
import threading
import time

import security
import droneEntity
import setEnviromentVariables as env
import mapConsumer
import communication
import targetPositionConsumer

def get_body_to_send(drone: droneEntity.DroneEntity) -> str:
    """
    :param drone: droneEntity.DroneEntity
    :return: bytes

    like: {
        "id": 512,
        "password": "0fd422fa-f",
        "timestamp": 1704589574,
        "token": "NTEyIzE3MDQ1ODk1NzQ="
    }
    """
    return json.dumps({
        "id": drone.drone_id,
        "password": drone.token,
        "timestamp": drone.timestamp,
        "token": drone.temporal_token
    })

def send_message(body: str) -> dict:
    """
    :param body: bytes
    :return: dict (response)
    """
    try:
        url = f"http://{env.getEngineHost()}:{env.getEnginePortHttp()}/register"
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, data=body, headers=headers, verify=False)
        dict_response = json.loads(response.text)
        print(f"Response: {dict_response.get('message', '')}")
        if not dict_response["ok"]:
            raise Exception(dict_response["message"])

        return dict_response



    except Exception as e:
        print(f"Error in send_message: {e}")
        raise e



def main(drone: droneEntity.DroneEntity, show_map: bool):
    """
    :param drone: droneEntity.DroneEntity
    :param show_map: bool
    :return: None
    """
    try:
        # subscribe drone in AD_Engine
        print(f"Starting connection with AD_Engine for drone: {drone}...")
        # Open target position topic
        print("abriendo topics... ")
        openSuccessfully = [False]
        targetPositionConsumerIsOpen = threading.Event()
        targetPositionConsumerThread = threading.Thread(target=targetPositionConsumer.main, args=(drone, targetPositionConsumerIsOpen, openSuccessfully))
        targetPositionConsumerThread.start()
        targetPositionConsumerIsOpen.wait()

        # validating if target_position topic is open
        if not openSuccessfully:
            print("Error opening target_position topic. Closing connection...")
            return

        print("Subscribed to target_position...")
        print("Esperando unos segundos (10s) de cortesía para que se pueda abrir adecuadamente el consumidor de target_position...")
        time.sleep(10)

        body = get_body_to_send(drone)
        print(f"Body to send: {body}")
        response = send_message(body)
        print(f"Response: {response}")
        # start map consumer thread
        if show_map:
            print("Starting map consumer thread...")
            mapConsumerThread = threading.Thread(target=mapConsumer.main, args=(drone,))
            mapConsumerThread.start()
        else:
            print("Map consumer is not going to be started...")

        # read communication messages from AD_Engine
        print("Starting communication thread...")
        communicationThread = threading.Thread(target=communication.main, args=(drone,))
        communicationThread.start()



    except Exception as e:
        print(f"Error in authentication: {e}")

import sys
import json
import socket
import threading

import targetPositionConsumer
import setEnviromentVariables
import droneEntity
import utils


def send_data(drone: droneEntity):
    try:
        message = {
            "id_registry": drone.drone_id,
            "token": drone.token,
        }
        json_message = utils.to_json(message)
        print(f"Sending data: {json_message}")

        drone_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        drone_socket.connect(
            (
                setEnviromentVariables.getEngineHost(),
                setEnviromentVariables.getEnginePort()
            )
        )

        # Authentication request
        drone_socket.sendall(
            json_message.encode(setEnviromentVariables.getEncoding())
        )

        # Authentication response. Open target position topic request
        response = drone_socket.recv(
            setEnviromentVariables.getMaxContentLength()
        )
        clean_response = response.decode(setEnviromentVariables.getEncoding())
        print(f"Received data: {clean_response}")
        if utils.from_json(clean_response)["ok"] is False:
            print("Authentication failed. Closing connection...")
            drone_socket.close()
            return

        # open target position topic
        print("abriendo topics... ")
        targetPositionConsumerIsOpen = threading.Event()
        targetPositionConsumerThread = threading.Thread(target=targetPositionConsumer.main, args=(drone, targetPositionConsumerIsOpen))
        targetPositionConsumerThread.start()
        targetPositionConsumerIsOpen.wait()
        print("topics abiertos...")

        # Authentication response. confirmation aperture current position topic
        openedCorrectly = True
        confirmationMessage = {
            "ok": openedCorrectly
        }
        json_confirmationMessage = utils.to_json(confirmationMessage)

        drone_socket.sendall(
            json_confirmationMessage.encode(setEnviromentVariables.getEncoding())
        )

        drone_socket.close()
        print("Authentication completed successfully")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
def main(drone_id: int, token: str, alias: str):
    try:
        print("Starting authentication...")
        drone = droneEntity.DroneEntity(
            drone_id=int(drone_id),
            token=token,
            alias=alias)
        send_data(drone)


    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python3 authentication.py <id> <token> <alias>")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2], sys.argv[3])
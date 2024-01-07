import sys
import time
import socket
import threading

import targetPositionConsumer
import setEnviromentVariables
import droneEntity
import utils


def main(drone: droneEntity.DroneEntity):
    try:
        # FASE_1 - Autenticación: AD_Drone -> AD_Engine
        message = utils.to_json({
            "stage": "auth_request",
            "id_registry": drone.drone_id,
            "token": drone.token,
        }).encode(setEnviromentVariables.getEncoding())
        print(f"Sending data. stage=auth_request: {message}")

        drone_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        drone_socket.connect(
            (
                setEnviromentVariables.getEngineHost(),
                setEnviromentVariables.getEnginePort()
            )
        )

        drone_socket.sendall(message)

        # Fase_1 - Autenticación: AD_Engine -> AD_Drone
        response = drone_socket.recv(
            setEnviromentVariables.getMaxContentLength()
        ).decode(setEnviromentVariables.getEncoding())
        print(f"Received data: {response}")
        if utils.from_json(response)["ok"] is False:
            print("Authentication failed. Closing connection...")
            drone_socket.close()
            return

        # Fase_2 - ack_subscribe: AD_Drone -> AD_Engine
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
            drone_socket.close()
            return


        print("Subscribed to target_position...")
        print("Esperando unos segundos (10s) de cortesía para que se pueda abrir adecuadamente el consumidor de target_position...")
        time.sleep(10)
        message = utils.to_json({
            "stage": "ack_subscribe",
            "id_registry": drone.drone_id,
            "token": drone.token,
            "ackSubscribe": True
        }).encode(setEnviromentVariables.getEncoding())

        print(f"Ack subscribe. Sending data: {message}")
        drone_socket.sendall(message)

        print(f"Authentication completed successfully. Finishing this service. \
        Map consumer, target_position consumer and current_position producer are currently executing in a different thread right now. ")
        drone_socket.close()

    except Exception as e:
        print(f"Error in module authentication: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python3 authentication.py <id> <token> <alias>")
        sys.exit(1)

    drone = droneEntity.DroneEntity(
        drone_id=int(sys.argv[1]),
        token=sys.argv[2],
        alias=sys.argv[3]
    )
    main(drone)
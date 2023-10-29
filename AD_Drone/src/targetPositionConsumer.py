import sys
import threading
from kafka import KafkaConsumer
import json
import threading
import time

import setEnviromentVariables
import droneEntity
import droneMovement
import coordinateMovement
import utils
import currentPositionProductor

def handle_new_message(message: dict, drone: droneMovement.DroneMovement):
    #if not isinstance(droneMovement, droneMovement.DroneMovement):
    #    raise TypeError("drone must be a droneMovement.DroneMovement instance. But found: " + str(type(drone)))
    print(f"Drone type: {type(drone)}")

    print(f"New message received: {message}")
    drone_id = get_drone_id_from_message(message)
    if drone_id != drone.id_drone:
        print(f"Message not for this drone. {drone_id} != {drone.id_drone} Ignoring...")
        return

    # Get target position
    target_position = get_target_position_from_message(message)
    print(f"New target position: {target_position}")

    # Get current position
    current_position = drone.position
    print(f"Current position: {current_position}")

    # Get path
    path = utils.get_path(current_position, target_position)
    print(f"Path: ")
    for coord in path:
        print(str(coord))

    # Publish current position
    print("Starting publishing current position...")
    currentPositionProductor.publishCurrentPosition(drone, path)

    # Enviamos la posición actual al servidor para que el dron se mantenga vivo.
    while True:
        print("Drone is in target_position. Sending current position...", str(time.time()))
        currentPositionProductor.publishCurrentPosition(drone, [drone.position])
        time.sleep(setEnviromentVariables.getMessageDelay())


def get_target_position_from_message(message: dict) -> coordinateMovement.CoordinateMovement:
    position_dict = utils.from_json(message["target_position"])
    return coordinateMovement.CoordinateMovement(
        row=int(position_dict["row"]),
        col=int(position_dict["col"])
    )

def get_drone_id_from_message(message: dict) -> int:
    return int(message["id_registry"])


def main(drone: droneEntity.DroneEntity, targetPositionConsumerIsOpen: threading.Event, openSuccessfully: list):
    print("Starting targetPositionConsumer...")
    if not isinstance(drone, droneEntity.DroneEntity):
        raise TypeError("drone must be a droneEntity.DroneEntity instance. But found: " + str(type(drone)))

    topic_name = f"{setEnviromentVariables.getTargetPositionTopic()}"
    group_id_name = f"{setEnviromentVariables.getTargetPositionTopic()}_{drone.drone_id}_{time.time()}"

    try:
        consumer = KafkaConsumer(
            topic_name,
            bootstrap_servers=[f"{setEnviromentVariables.getBrokerHost()}:{setEnviromentVariables.getBrokerPort()}"],
            auto_offset_reset="latest",
            enable_auto_commit=True,
            group_id=group_id_name,
            value_deserializer=lambda x: json.loads(x.decode(setEnviromentVariables.getEncoding()))
        )

        print("Consumer created")
        # Avisamos que el consumer está listo y se ha abierto correctamente
        if targetPositionConsumerIsOpen is not None:
            openSuccessfully[0] = True
            targetPositionConsumerIsOpen.set()
            print("Consumer open has been communicated. ")

        print("Starting consuming target_position topic...")
        drone_movement = droneMovement.DroneMovement(
            id_drone=drone.drone_id,
            position=coordinateMovement.CoordinateMovement(1, 1)
        )
        for message in consumer:
            try:
                message = message.value
                handle_new_message(message, drone_movement)

            except Exception as e:
                print(f"Error in targetPositionConsumer. Ignoring message. {str(e)}")

    except Exception as e:
        print(f"Error in targetPositionConsumer. : {e}")
        if targetPositionConsumerIsOpen is not None:
            openSuccessfully[0] = False
            targetPositionConsumerIsOpen.set()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python targetPositionConsumer.py <droneId>")
        sys.exit(-1)

    drone_movement = droneMovement.DroneMovement(
        id_drone=int(sys.argv[1]),
        position=coordinateMovement.CoordinateMovement(1, 1)
    )
    main(drone_movement, None)
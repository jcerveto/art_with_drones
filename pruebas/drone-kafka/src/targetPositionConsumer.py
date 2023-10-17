import sys
import threading
from kafka import KafkaConsumer
import json

import setEnviromentVariables
import droneEntity
import coordinateMovement
import utils


def getTargetPositionFromMessage(message: dict) -> coordinateMovement.CoordinateMovement:
    position_dict = utils.from_json(message["target_position"])
    return coordinateMovement.CoordinateMovement(
        row=int(position_dict["row"]),
        col=int(position_dict["col"])
    )



def handle_new_position(
        current_position: coordinateMovement.CoordinateMovement
        , message: dict):
    print("Handling new position...")
    target_position: coordinateMovement.CoordinateMovement = getTargetPositionFromMessage(message)
    print("JOAN AQUI GESTIONAR LA NUEVA POSICION con hilos")
    path = utils.get_path_temp(current_position, target_position)
    print(f"Path: {path}")


def main(drone: droneEntity.DroneEntity, targetPositionConsumerIsOpen: threading.Event):
    topic_name = f"{setEnviromentVariables.getTargetPositionTopic(drone.drone_id)}"
    group_id_name = f"{setEnviromentVariables.getTargetPositionTopic(drone.drone_id)}_consumer_group"

    try:
        consumer = KafkaConsumer(
            topic_name,
            bootstrap_servers=[f"{setEnviromentVariables.getBrokerHost()}:{setEnviromentVariables.getBrokerPort()}"],
            auto_offset_reset="latest",
            enable_auto_commit=True,
            group_id=group_id_name,
            value_deserializer=lambda x: json.loads(x.decode("utf-8"))
        )

        print("Consumer created")
        # Avisamos que el consumer está listo
        targetPositionConsumerIsOpen.set()

        currrent_position = coordinateMovement.CoordinateMovement(1, 1)
        for message in consumer:
            message = message.value
            print(f"Message received: {message}")
            currrent_position = handle_new_position(
                current_position=currrent_position,
                message=message
            )

    except Exception as e:
        print(f"Error in targetPositionConsumer. Reraised: {e}")
        raise e


from kafka import KafkaProducer
import time
import json

import setEnviromentVariables
def publishCurrentPosition(drone, path):
    """
    Publish the current position of the drone in the topic of the drone
    :param drone: droneMovement.DroneMovement
    :param path: list[coordinateMovement.CoordinateMovement]
    :return:
    """
    print("Publishing current position...")
    topic_name = f"{setEnviromentVariables.getCurrentPositionTopic()}"
    print(f"Topic name: {topic_name}")
    producer = KafkaProducer(bootstrap_servers=[f"{setEnviromentVariables.getBrokerHost()}:{setEnviromentVariables.getBrokerPort()}"],
                                value_serializer=lambda x: json.dumps(x).encode(setEnviromentVariables.getEncoding()))

    for position in path:
        print(f"Publishing position: {position}")
        data = {
            'id_registry': drone.id_drone,
            'current_position': {
                'row': position.row,
                'col': position.col
            }
        }
        producer.send(topic_name, value=data)
        time.sleep(setEnviromentVariables.getMessageDelay())

    producer.close()

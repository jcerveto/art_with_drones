from kafka import KafkaConsumer
from json import loads
import time

import utils
import setEnviromentVariables
import security
import droneEntity

def main(drone: droneEntity.DroneEntity):
    print("Starting map consumer...")
    topic_name = setEnviromentVariables.getMapTopic()
    group_id = f"group_{setEnviromentVariables.getMapTopic()}_{time.time()}"

    consumer = KafkaConsumer(
        topic_name,
        bootstrap_servers=[f'{setEnviromentVariables.getBrokerHost()}:{setEnviromentVariables.getBrokerPort()}'],
        auto_offset_reset='latest',
        enable_auto_commit=True,
        group_id=group_id,
        value_deserializer=lambda x: loads(x.decode(setEnviromentVariables.getEncoding()))
    )

    print(f"Map consumer created: {str(consumer)}")

    for message in consumer:
        try:
            print(f"New map received. Time: {time.time()}")
            message = message.value
            if drone.generalKey is not None:
                message = security.decryptAES(drone.generalKey, message)
            utils.handle_map(message)
        except Exception as e:
            print(f"Error handling map. Waiting for next message. {e}")
            continue


if __name__ == "__main__":
    main()

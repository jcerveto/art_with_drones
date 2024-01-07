from kafka import KafkaConsumer
from json import loads
import time

import security
import setEnviromentVariables
import droneEntity


def handle_communication(message: dict, generalAesKey=None):
    encrypted_message_text = message["message"]
    if generalAesKey is None:
        clean_message_text = encrypted_message_text
    else:
        clean_message_text = security.decryptAES(generalAesKey ,encrypted_message_text)
    print(f"{'*' * 50}\nReceived message: {str(clean_message_text)}\n{'*' * 50}")



def main(drone: droneEntity.DroneEntity):
    print("Starting communication consumer...")
    topic_name = setEnviromentVariables.getCommunicationTopic()
    group_id = f"group_{setEnviromentVariables.getCommunicationTopic()}_{time.time()}"

    consumer = KafkaConsumer(
        topic_name,
        bootstrap_servers=[f'{setEnviromentVariables.getBrokerHost()}:{setEnviromentVariables.getBrokerPort()}'],
        auto_offset_reset='latest',
        enable_auto_commit=True,
        group_id=group_id,
        value_deserializer=lambda x: loads(x.decode(setEnviromentVariables.getEncoding()))
    )

    print(f"Communication consumer created: {str(consumer)}")

    for message in consumer:
        try:
            print(f"New communication received. Time: {time.time()}")
            message = message.value
            handle_communication(message, drone.generalKey)
        except Exception as e:
            print(f"Error handling communication. Waiting for next message. {e}")
            continue


if __name__ == "__main__":
    main()

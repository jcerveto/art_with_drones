from kafka import KafkaConsumer
from json import loads
import time

import setEnviromentVariables


def handle_communication(message: dict):
    message_text = message["message"]
    print(f"{'*' * 50}\nReceived message: {str(message_text)}\n{'*' * 50}")



def main():
    print("Starting comunication consumer...")
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

    print(f"Comunication consumer created: {str(consumer)}")

    for message in consumer:
        try:
            print(f"New comunication received. Time: {time.time()}")
            message = message.value
            handle_communication(message)
        except Exception as e:
            print(f"Error handling comunication. Waiting for next message. {e}")
            continue


if __name__ == "__main__":
    main()

# https://towardsdatascience.com/kafka-python-explained-in-10-lines-of-code-800e3e07dad1

import sys
from kafka import KafkaConsumer
from json import loads

import utils
import setEnviromentVariables


def main():

    topic_name = brokerSettings.getMapTopic()
    group_id = f"group_{brokerSettings.getMapTopic()}"

    consumer = KafkaConsumer(
        topic_name,
        bootstrap_servers=[f'{setEnviromentVariables.getBrokerHost()}:{setEnviromentVariables.getBrokerPort()}'],
        auto_offset_reset='latest',
        enable_auto_commit=True,
        group_id=group_id,
        value_deserializer=lambda x: loads(x.decode('utf-8')))


    for message in consumer:
        message = message.value
        utils.handle_map(message)

if __name__ == "__main__":
    main()
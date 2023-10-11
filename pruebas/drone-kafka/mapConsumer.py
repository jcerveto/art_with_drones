# https://towardsdatascience.com/kafka-python-explained-in-10-lines-of-code-800e3e07dad1

import sys
from kafka import KafkaConsumer
from json import loads

import utils


def main(argv):

    if len(argv) != 3:
        print("Usage: python consumer_kafka.py <topic_name> <group_id>")
        sys.exit(1)

    topic_name = argv[1]
    group_id = argv[2]

    consumer = KafkaConsumer(
        topic_name,
        bootstrap_servers=['localhost:29092'],
        auto_offset_reset='latest',
        enable_auto_commit=True,
        group_id=group_id,
        value_deserializer=lambda x: loads(x.decode('utf-8')))


    for message in consumer:
        message = message.value
        utils.handle_map(message)
if __name__ == "__main__":
    main(sys.argv)
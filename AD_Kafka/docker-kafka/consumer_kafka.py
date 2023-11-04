# https://towardsdatascience.com/kafka-python-explained-in-10-lines-of-code-800e3e07dad1

import sys
from kafka import KafkaConsumer
from json import loads
import time

def main(argv):
    if len(argv) != 5:
        print("Usage: python consumer_kafka.py <kafka_host> <kafka_port> <topic_name> <group_id>")
        sys.exit(1)

    kafka_host = argv[1]
    kafka_port = argv[2]
    topic_name = argv[3]
    group_id = argv[4]

    # KAFKA PORT SUELE SER 29092
    consumer = KafkaConsumer(
        topic_name,
        bootstrap_servers=[f'{kafka_host}:{kafka_port}'],
        auto_offset_reset='latest',
        enable_auto_commit=True,
        group_id=group_id,
        value_deserializer=lambda x: loads(x.decode('utf-8')))


    for message in consumer:
        message = message.value
        print(f"Read from Kafka in topic: {topic_name}, group_id: {group_id}, message: {message}, {time.time()}")

if __name__ == "__main__":
    main(sys.argv)
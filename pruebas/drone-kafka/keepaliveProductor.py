import sys
from kafka import KafkaProducer
import time
import json

import brokerSettings


def main(dronId: int):
    keep_alive_topic = brokerSettings.getKeepAliveTopic(dronId)
    print(f"Keep alive topic: {keep_alive_topic}")

    producer = KafkaProducer(bootstrap_servers=[f"{brokerSettings.getBrokerHost()}:{brokerSettings.getBrokerPort()}"],
                             value_serializer=lambda x:
                             json.dumps(x).encode('utf-8'))

    i = 0
    while True:
        data = {
            'droneId': dronId,
            'keep_alive': time.time(),
            'iteration': i
        }
        i += 1
        producer.send(keep_alive_topic, value=data)
        print(f"New keepAlive published in topic: {keep_alive_topic}. time: {time.time()}")
        time.sleep(5)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python keepaliveProductor.py <dronId>")
        sys.exit(1)
    main(int(sys.argv[1]))


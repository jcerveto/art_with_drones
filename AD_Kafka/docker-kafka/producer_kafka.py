#https://towardsdatascience.com/kafka-python-explained-in-10-lines-of-code-800e3e07dad1

import sys
from time import sleep
from json import dumps
from kafka import KafkaProducer

def main(argv):
    print(argv)
    if len(argv) != 2:
        print("Usage: python producer_kafka.py <topic_name>")
        sys.exit(1)
    topic_name = argv[1]

    producer = KafkaProducer(bootstrap_servers=['localhost:29092'],
                            value_serializer=lambda x: 
                            dumps(x).encode('utf-8'))

    for e in range(1000):
        data = {'number' : e}
        producer.send(topic_name, value=data)
        print(f"New message published in topic: {topic_name}: {data}")
        sleep(5)
    
if __name__ == "__main__":
    main(sys.argv)
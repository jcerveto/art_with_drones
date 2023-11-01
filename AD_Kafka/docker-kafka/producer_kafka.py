#https://towardsdatascience.com/kafka-python-explained-in-10-lines-of-code-800e3e07dad1

import sys
from time import sleep
from json import dumps
from kafka import KafkaProducer

def main(argv):
    print(argv)
    if len(argv) != 4:
        print("Usage: python producer_kafka.py <kafka_host> <kafka_port> <topic_name>")
        sys.exit(1)

    kafka_host = argv[1]
    kafka_port = argv[2]
    topic_name = argv[3]

    # KAFKA PORT SUELE SER 29092
    producer = KafkaProducer(bootstrap_servers=[f'{kafka_host}:{kafka_port}'],
                            value_serializer=lambda x: 
                            dumps(x).encode('utf-8'))

    for e in range(1000):
        data = {'number' : e}
        producer.send(topic_name, value=data)
        print(f"New message published in topic: {topic_name}: {data}")
        sleep(5)
    
if __name__ == "__main__":
    main(sys.argv)
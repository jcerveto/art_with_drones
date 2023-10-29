import threading

import droneEntity
import authentication
import mapConsumer

def main(drone: droneEntity.DroneEntity, show_map=False):
    print(f"Starting connection with AD_Engine for drone: {drone}...")

    # map consumer
    if show_map:
        print("Starting map consumer thread...")
        mapConsumerThread = threading.Thread(target=mapConsumer.main, args=())
        mapConsumerThread.start()
    else:
        print("Map consumer is not going to be started...")

    # authenticate
    print("Starting authentication main thread...")
    authentication.main(drone)
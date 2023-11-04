import threading

import droneEntity
import authentication
import mapConsumer
import communication

def main(drone: droneEntity.DroneEntity, show_map=False):
    print(f"Starting connection with AD_Engine for drone: {drone}...")

    # start map consumer thread
    if show_map:
        print("Starting map consumer thread...")
        mapConsumerThread = threading.Thread(target=mapConsumer.main, args=())
        mapConsumerThread.start()
    else:
        print("Map consumer is not going to be started...")

    # read communication messages from AD_Engine
    print("Starting communication thread...")
    communicationThread = threading.Thread(target=communication.main, args=())
    communicationThread.start()


    # authenticate drone in AD_Engine (main thread)
    print("Starting authentication main thread...")
    authentication.main(drone)

    
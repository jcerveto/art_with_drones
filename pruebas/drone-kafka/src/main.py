import sys
import threading
import time
import os

import mapConsumer
import keepaliveProductor

def main(argv):
    if len(argv) != 2:
        print("Usage: python main.py <drone_id>")
        sys.exit(1)
    
    print(f"PID: {os.getpid()}")


    # PRINT MAP THREAD
    mapConsumerThread = threading.Thread(target=mapConsumer.main, args=())
    mapConsumerThread.start()

    # PRODUCE KEEP ALIVE THREAD
    # keepaliveProductorThread = threading.Thread(target=keepaliveProductor.main, args=(int(argv[1]),))
    # keepaliveProductorThread.start()

    # CONSUMER TARGET POSITION THREAD
    #...

    # MAIN THREAD

    for i in range(10):
        print("Hello, World!")
        time.sleep(1)
    sys.exit(0)


if __name__ == "__main__":
    main(sys.argv)
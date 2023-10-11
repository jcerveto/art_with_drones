import sys
import threading
import time
import mapConsumer


def main(argv):
    print("Hello, World!")
    
    mapConsumerThread = threading.Thread(target=mapConsumer.main, args=(argv,))
    mapConsumerThread.start()
    for i in range(10):
        print("Hello, World!")
        time.sleep(1)
    sys.exit(0)


if __name__ == "__main__":
    main(sys.argv)
import sys
from serverEntity import ServerEntity
import setEnv


def main(argv):
    if len(argv) != 1:
        print(f"Usage: {argv[0]}")
        sys.exit(1)
    HOST = setEnv.get_host()
    PORT = setEnv.get_port()
    server = ServerEntity(HOST, PORT)
    server.start()


if __name__ == '__main__':
    print("Hola mundo")
    main(sys.argv)

import sys
from serverEntity import ServerEntity

def main(argv):
    if len(argv) != 2:
        print(f"Usage: {argv[0]} <port>")
        sys.exit(1)
    HOST = '0.0.0.0'
    PORT = int(argv[1])
    server = ServerEntity(HOST, PORT)
    server.start()

if __name__ == '__main__':
    print("Hola mundo")
    main(sys.argv)

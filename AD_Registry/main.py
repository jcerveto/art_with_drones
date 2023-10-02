import sys

from src import serverEntity


def main(argv: list):
    if len(argv) != 2:
        print(f"Usage: {argv[0]} <port>")
        sys.exit(1)

    host = '127.0.0.1'
    port = int(argv[1])
    print("Hello World!")
    s = serverEntity.ServerEntity(host, port)
    s.start()
    print("Bye World!")


if __name__ == '__main__':
    main(sys.argv)

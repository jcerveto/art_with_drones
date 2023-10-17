import socket
import threading
import sys
from os import getpid
from time import sleep

class OneRequestSocketServer:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(1)
        self.lock = threading.Lock()
        print(f"Server listening on {self.host}:{self.port}. Get pid: {getpid()}")

    def handle_request(self):
        client_socket, client_address = self.server_socket.accept()
        with self.lock:
            client_data = client_socket.recv(1024)
            print(f"Received: {client_data.decode('utf-8')}")
            sleep(10)
            client_socket.sendall(b'Hello, world!')
            print(f"Sent: Hello, world!")
        client_socket.close()

    def start(self):
        try:
            while True:
                self.handle_request()
        except KeyboardInterrupt:
            print("Pressed Ctrl + C. Server stopped.")
            self.server_socket.close()

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <port>")
        sys.exit(1)
    HOST = 'localhost'
    PORT = int(sys.argv[1])
    server = OneRequestSocketServer(HOST, PORT)
    server.start()

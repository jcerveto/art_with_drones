import socket
import threading
import sys
from os import getpid
from time import sleep

from .drone import droneEntity


class ServerImplementation:
    MAX_SIZE = 1024
    FORMAT = 'utf-8'

    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(1)
        self.lock = threading.Lock()
        self.total_requests = 0
        print(f"Server listening on {self.host}:{self.port}. Get pid: {getpid()}")

    def handle_request(self):
        client_socket, client_address = self.server_socket.accept()
        print(f"Connection from {client_address} has been established!")
        with self.lock:
            self.total_requests += 1
            try:
                print(f"Handling request from {client_address}... Number of requests: {self.total_requests}")
                client_data = client_socket.recv(self.MAX_SIZE)
                print(f"Received: {client_data}")

                response = self.get_response_from_request(client_data)
                client_socket.sendall(response)
                print(f"Sent: {response}")
                print(f"Closing connection from {client_address}...")
                client_socket.close()

            except KeyboardInterrupt:
                print("Pressed Ctrl + C. Closing server...")
                self.stop()
            except Exception as e:
                print(f"Error handling request: {e}")

    def start(self):
        try:
            while True:
                self.handle_request()
        except KeyboardInterrupt:
            print("Pressed Ctrl + C. Server stopped.")
            self.server_socket.close()

    def stop(self):
        try:
            self.server_socket.close()
        except Exception as e:
            print(f"The server was already closed. Exception: {e}")
            sys.exit(1)

    def get_response_from_request(self, request: bytes) -> bytes:
        clean_request = self.decode(request)

        # AQUI VA LA LOGICA DE NEGOCIO

        drone_obj = droneEntity.DroneEntity(
            id=str(self.total_requests),
            alias=f"Drone {self.total_requests}"
        )
        if drone_obj.create():
            msg = f"Drone {self.total_requests} created"
        else:
            msg = f"Drone {self.total_requests} not created"

        # FIN DE LA LOGICA DE NEGOCIO
        msg = self.encode(msg)
        return msg

    def encode(self, msg: str) -> bytes:
        return msg.encode(self.FORMAT)

    def decode(self, msg: bytes) -> str:
        return msg.decode(self.FORMAT)

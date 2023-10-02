import socket
from os import getpid
from time import sleep
import threading
import json

import persistence as db


class ServerImplementation:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.server_socket = self.create_socket()

    @staticmethod
    def create_socket():
        return socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    def start(self):
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(1)
        print(f"Server listening on {self.host}:{self.port}. Get pid: {getpid()}")
        
        try:
            while True:
                client_socket, client_address = self.server_socket.accept()
                print(f"Connected to {client_address}")
                threading.Thread(target=self.handle_request, args=(client_socket,)).start()
        except KeyboardInterrupt:
            print("Pressed Ctrl + C. Server stopped.")
            self.stop()

    @staticmethod
    def handle_request(client_socket):
        try:
            client_data = client_socket.recv(1024)
            print(f"Received: {client_data.decode('utf-8')}")
            response = ServerImplementation.get_response(client_data)
            client_socket.sendall(response)
            print(f"Sent: {response}")
        except KeyboardInterrupt:
            print("Pressed Ctrl + C. Stopping server...")
        finally:
            client_socket.close()

    @staticmethod
    def get_response(request: bytes) -> str:
        print("Processing request...")
        clean_request = request.decode('utf-8')
        city = clean_request
        print(f"City: {city}")
        temp = db.get_temperature("data/cities.csv", city)
        json_response = {
            "city": "alacant",
            "temperature": temp
        }
        return json.dumps(json_response).encode('utf-8')


class ServerEntity:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.server_socket = ServerImplementation(self.host, self.port)

    def start(self):
        try:
            self.server_socket.start()
        except KeyboardInterrupt:
            print("Pressed Ctrl + C. Server stopped.")
            self.server_socket.stop()

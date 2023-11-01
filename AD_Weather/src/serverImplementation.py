import socket
from os import getpid
import time
import threading
import json

import persistence as db
import setEnv as env


class ServerImplementation:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.server_socket = self.create_socket()

        self.currents_requests = 0
        self.total_requests = 0

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
                print(f"{50 * '*'}\nConnection from {client_address} has been established!")

                handle_request_thread = threading.Thread(target=self.handle_request, args=(client_socket,))

                # Lógica de reintentos si se alcanza el máximo de conexiones concurrentes
                while True:
                    if self.currents_requests < env.get_max_concurrent_connections():
                        break
                    print(f"Max concurrent connections reached: {self.currents_requests}. Waiting...",
                          str(time.process_time()))
                    time.sleep(0.1)
                handle_request_thread.start()

        except KeyboardInterrupt:
            print("Pressed Ctrl + C. Server stopped.")
            self.stop()

    def handle_request(self, client_socket):
        try:
            self.currents_requests += 1
            print(
                f"{50 * '+'}\nExecuting handle_request. Currents requests: {self.currents_requests} in a new thread. ")
            self.total_requests += 1

            client_data = client_socket.recv(env.get_max_message_size())
            print(f"Received raw data: {client_data}")
            response = self.get_response(client_data)
            client_socket.sendall(response)
            print(f"Sent: {response}")

            print(f"Closing connection...\n{50 * '-'}\n")
            self.currents_requests -= 1
            client_socket.close()
        except KeyboardInterrupt:
            print("Pressed Ctrl + C. Stopping server...")
            self.currents_requests -= 1
            print(f"Currents requests: {self.currents_requests}")
            self.stop()
        except Exception as e:
            self.currents_requests -= 1
            print(f"Error handling request: {e}. Closing socket...")
            client_socket.close()

    def get_response(self, request: bytes) -> str:
        print("Processing request...")
        clean_request = request.decode(env.get_encoding())
        print(f"Clean request: {clean_request}")
        city = clean_request
        print(f"City: {city}")
        temp = db.get_temperature(city)
        json_response = {
            "city": "alacant",
            "temperature": temp
        }
        return json.dumps(json_response).encode(env.get_encoding())


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

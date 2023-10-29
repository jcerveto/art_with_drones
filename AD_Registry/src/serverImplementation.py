import socket
import threading
import sys
import time
import json
from os import getpid

import src.setEnviromentVariables as env
from src.drone import droneEntity


class ServerImplementation:
    FORMAT = 'utf-8'

    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(1)
        self.total_requests = 0
        self.currents_requests = 0
        print(f"Server listening on {self.host}:{self.port}. Get pid: {getpid()}")

    def handle_request(self, client_socket: socket.socket, client_address: tuple):
        self.currents_requests += 1
        print(f"{50*'+'}\nExecuting handle_request. Currents requests: {self.currents_requests} in a new thread. ")

        self.total_requests += 1
        try:
            print(f"Handling request from {client_address}... Total number of requests: {self.total_requests}")
            client_data = client_socket.recv(env.get_max_content_length())
            print(f"Received: {client_data}")

            response = self.get_response_from_request(client_data)
            client_socket.sendall(response)
            print(f"Sent: {response}")
            print(f"Closing connection from {client_address}...\n{50 * '-'}\n")
            client_socket.close()

            self.currents_requests -= 1

        except KeyboardInterrupt:
            print("Pressed Ctrl + C. Closing server...")
            self.currents_requests -= 1
            print(f"Currents requests: {self.currents_requests}")
            self.stop()
        except Exception as e:
            self.currents_requests -= 1
            print(f"Error handling request: {e}")

    def start(self):
        try:
            while True:
                client_socket, client_address = self.server_socket.accept()
                print(f"{50*'*'}\nConnection from {client_address} has been established!")

                client_thread = threading.Thread(
                    target=self.handle_request,
                    args=(
                        client_socket,
                        client_address
                    )
                )

                # Lógica de reintentos si se alcanza el máximo de conexiones concurrentes
                while True:
                    if self.currents_requests < env.get_max_concurrent_connections():
                        break
                    print(f"Max concurrent connections reached: {self.currents_requests}. Waiting...",
                          str(time.process_time()))
                    time.sleep(0.1)
                client_thread.start()
        except KeyboardInterrupt:
            print("Pressed Ctrl + C. Server stopped.")
            self.server_socket.close()

    def stop(self):
        try:
            self.server_socket.close()
        except Exception as e:
            print(f"The server was already closed. Exception: {e}")
            sys.exit(1)

    @staticmethod
    def get_response_from_request(raw_request: bytes) -> bytes:
        try:
            clean_request = ServerImplementation.decode(raw_request)
            print(f"Decoded request: {clean_request}")
            # AQUI VA LA LOGICA DE NEGOCIO
            parsed_request = json.loads(clean_request)
            print(f"Parsed request: {parsed_request}")

            # create
            if parsed_request["action"] == "create":
                drone_obj = droneEntity.DroneEntity(
                    id=int(parsed_request["id_registry"]),
                    alias=parsed_request["alias"]
                )
                drone_token = drone_obj.create()
                if drone_token == '':
                    msg = ServerImplementation.encode(json.dumps({
                        "ok": False,
                        "message": f"Drone {parsed_request['id_registry']} already exists"
                    }))
                else:
                    msg = ServerImplementation.encode(json.dumps({
                        "ok": True,
                        "message": f"Drone {parsed_request['id_registry']} created",
                        "token": drone_token
                    }))
            elif parsed_request["action"] == "update":
                drone_obj = droneEntity.DroneEntity(
                    id=int(parsed_request["id_registry"]),
                    alias=parsed_request["alias"],
                    token=parsed_request["token"]
                )
                drone_obj.update()
                msg = ServerImplementation.encode(json.dumps({
                    "ok": True,
                    "message": f"Drone {parsed_request['id_registry']} updated"
                }))
            elif parsed_request["action"] == "delete":
                drone_obj = droneEntity.DroneEntity(
                    id=int(parsed_request["id_registry"]),
                    alias=parsed_request["alias"],
                    token=parsed_request["token"]
                )
                drone_obj.delete()
                msg = ServerImplementation.encode(json.dumps({
                    "ok": True,
                    "message": f"Drone {parsed_request['id_registry']} deleted"
                }))
            else:
                msg = ServerImplementation.encode(json.dumps({
                    "ok": False,
                    "message": f"Invalid action: {parsed_request['action']}"
                }))
            # FIN DE LA LOGICA DE NEGOCIO
            return msg
        except Exception as e:
            print(f"Error in get_response_from_request: {e}")
            return ServerImplementation.encode(json.dumps({
                "ok": False,
                "message": f"Error in get_response_from_request: {e}"
            }))

    @staticmethod
    def encode(msg: str) -> bytes:
        return msg.encode(env.get_encoding())

    @staticmethod
    def decode(msg: bytes) -> str:
        return msg.decode(env.get_encoding())

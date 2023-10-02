import socket
import json

HOST = "127.0.0.1"
PORT = "8090"

def send_data(drone):
    try:
        message = encode_data(drone)
        client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client_socket.connect((HOST, PORT))
        client_socket.send(message.encode())
        response = client_socket.recv(128)
        print(response.decode())
        client_socket.close()

    except Exception:
        client_socket.close()

"""
Codificar los datos del dron en JSON

@param drone: Drone
"""
def encode_data(drone):
    return json.dumps({
        "id": drone.id,
        "coords": { "x": drone.x, "y": drone.y},
        "status": drone.status
        })

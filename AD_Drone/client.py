import socket
import json

HOST = "localhost"
PORT = 8090

def send_data(drone):
    try:
        message = encode_data(drone)
        client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client_socket.connect((HOST, PORT))
        client_socket.send(message.encode())
        response = client_socket.recv(128)
        print(f"RECEIVED {response.decode()} ON DRONE {drone.id}")
        client_socket.close()

    except Exception:
        print(f"CONNECTION ERROR ON DRONE {drone.id}")
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

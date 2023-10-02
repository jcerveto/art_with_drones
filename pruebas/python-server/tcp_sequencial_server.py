import sys
import socket

class SocketServer:
    def __init__(self, host, port):
        self.host = host
        self.port = port

    def start(self):
        try:
            server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server_socket.bind((self.host, self.port))
            server_socket.listen(1)
            print(f"El servidor está escuchando en {self.host}:{self.port}")

            while True:
                client_socket, client_address = server_socket.accept()
                print(f"Conexión entrante desde {client_address}")
                data = client_socket.recv(1024)
                if not data:
                    break
                message = data.decode().strip()
                response = message.upper()
                client_socket.send(response.encode())
                client_socket.close()
                print(f"Respuesta enviada a {client_address}: {response}")

        except KeyboardInterrupt:
            print("Servidor detenido.")
        finally:
            server_socket.close()

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <port>")
        sys.exit(1)
    HOST = 'localhost'
    PORT = int(sys.argv[1])
    print("Hola caracola")
    server = SocketServer(HOST, PORT)
    server.start()

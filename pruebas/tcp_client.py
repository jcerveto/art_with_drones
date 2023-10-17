import socket
import sys
import threading

    
def main(argv: list):
    if len(argv) != 3:
        print(f"Usage: {argv[0]} <host> <port>")
        sys.exit(1)
        
    HOST = argv[1]
    PORT = int(argv[2])
    try:
        client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client_socket.connect((HOST, PORT))
        print(f"Connected to server at {HOST}:{PORT}")

        message = "Hello from client!"
        client_socket.send(message.encode('utf-8'))
        print(f"Sent: {message}")

        response = client_socket.recv(1024)
        print(f"Received: {response.decode('utf-8')}")

        client_socket.close()
        print("Connection closed")

    except KeyboardInterrupt:
        print("Ctrl + C pressed. Stopping client...")
        client_socket.close()
        print("Client stopped.")

if __name__ == "__main__":
    main(sys.argv)

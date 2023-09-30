import serverImplementation as server_impl

class ServerEntity:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.server_socket = server_impl.ServerImplementation(self.host, self.port)

    def start(self):
        try:
            self.server_socket.start()
        except KeyboardInterrupt:
            print("Pressed Ctrl + C. Server stopped.")
            self.stop()

    def stop(self):
        try:
            self.server_socket.stop()
        except Exception as e:
            print(f"Error stopping server: {str(e)}")

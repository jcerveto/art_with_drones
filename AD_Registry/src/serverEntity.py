from src import serverImplementation


class ServerEntity:
    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port
        self.server = serverImplementation.ServerImplementation(self.host, self.port)
    
    def start(self):
        try:
            self.server.start()
        except KeyboardInterrupt:
            print("Pressed Ctrl + C. Server stopped.")
            self.server.stop()
    
    def stop(self):
        try:
            self.server.stop()
        except Exception as e:
            print(f"The server was already closed. Exception: {e}")
    
        
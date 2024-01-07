class DroneEntity:
    def __init__(self, drone_id: int, alias: str, token=None):
        self.drone_id = drone_id
        self.alias = alias
        self.token = token
        

        self.temporal_token = None
        self.timestamp = None

        self.generalKey = ''
        self.personalKey = ''


    def __str__(self):
        return f"[{self.drone_id}, {self.alias}, {self.token}]"

    def __repr__(self):
        return f"[id={self.drone_id}, alias={self.alias}, token={self.token}]"


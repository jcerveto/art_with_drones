import dotenv
import os

dotenv.load_dotenv()


def getBrokerHost() -> str:
    return os.getenv('KAFKA_HOST', '0.0.0.0')

def getBrokerPort() -> str:
    return os.getenv('KAFKA_PORT', 9092)

def getMapTopic() -> str:
    return os.getenv('KAFKA_TOPIC_MAP', 'map')

def getKeepAliveTopic(droneId: int) -> str:
    if droneId is None or type(droneId) is not int:
        raise ValueError(f"droneId must be an integer, but is {droneId}")
    keepAliveTopic = os.getenv('KAFKA_TOPIC_KEEP_ALIVE', 'keep_alive')
    return f"{keepAliveTopic}_{droneId}"

def getTargetPositionTopic(droneId: int) -> str:
    if droneId is None or type(droneId) is not int:
        raise ValueError(f"droneId must be an integer, but is {droneId}")
    targetPositionTopic = os.getenv('KAFKA_TOPIC_TARGET_POSITION', 'target_position')
    return f"{targetPositionTopic}_{droneId}"

def getCurrentPositionTopic(droneId: int) -> str:
    if droneId is None or type(droneId) is not int:
        raise ValueError(f"droneId must be an integer, but is {droneId}")
    currentPositionTopic = os.getenv('KAFKA_TOPIC_CURRENT_POSITION', 'current_position')
    return f"{currentPositionTopic}_{droneId}"

def getMessageDelay() -> int:
    return int(os.getenv('MESSAGE_DELAY', 5))


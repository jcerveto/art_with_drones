import dotenv
import os

dotenv.load_dotenv()


def getBrokerHost() -> str:
    return os.getenv('KAFKA_HOST', '0.0.0.0')

def getBrokerPort() -> str:
    return os.getenv('KAFKA_PORT', 9092)

def getMapTopic() -> str:
    return os.getenv('KAFKA_TOPIC_MAP', 'map')

def getKeepAliveTopic() -> str:
    return f"{keepAliveTopic}_{droneId}"

def getTargetPositionTopic() -> str:
    return os.getenv('KAFKA_TOPIC_TARGET_POSITION', 'target_position')

def getCurrentPositionTopic() -> str:
    return os.getenv('KAFKA_TOPIC_CURRENT_POSITION', 'current_position')

def getMessageDelay() -> int:
    return int(os.getenv('MESSAGE_DELAY', 5))

def getEngineHost() -> str:
    return os.getenv('ENGINE_HOST', '0.0.0.0')

def getEnginePort() -> int:
    return int(os.getenv('ENGINE_PORT', 8080))

def getEncoding() -> str:
    return os.getenv('ENCODING', 'utf-8')

def getMaxContentLength() -> int:
    return int(os.getenv('MAX_CONTENT_LENGTH', 1024))
    
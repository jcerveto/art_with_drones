import dotenv
import os

dotenv.load_dotenv()


def getBrokerHost() -> str:
    return os.getenv('KAFKA_HOST', '0.0.0.0')

def getBrokerPort() -> str:
    return os.getenv('KAFKA_PORT', 9092)

def getMapTopic() -> str:
    return os.getenv('KAFKA_TOPIC_MAP', 'map')


def getTargetPositionTopic() -> str:
    return os.getenv('KAFKA_TOPIC_TARGET_POSITION')

def getCurrentPositionTopic() -> str:
    return os.getenv('KAFKA_TOPIC_CURRENT_POSITION')

def getMessageDelay() -> int:
    return int(os.getenv('MESSAGE_DELAY'))

def getEngineHost() -> str:
    return os.getenv('ENGINE_HOST')

def getEnginePort() -> int:
    return int(os.getenv('ENGINE_PORT'))

def getRegistryHost() -> str:
    return os.getenv('REGISTRY_HOST')

def getRegistryPort() -> int:
    return int(os.getenv('REGISTRY_PORT'))

def getEncoding() -> str:
    return os.getenv('ENCODING')

def getMaxContentLength() -> int:
    return int(os.getenv('MAX_CONTENT_LENGTH'))

def getDronesPath() -> str:
    return os.getenv('DRONE_PATH')
    
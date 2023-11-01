import os
import dotenv

dotenv.load_dotenv()


def get_host() -> str:
    return os.getenv("HOST")


def get_port() -> int:
    return int(os.getenv("PORT"))


def get_cities_file() -> str:
    return os.getenv("CITIES_FILE")


def get_max_concurrent_connections() -> int:
    return int(os.getenv("MAX_CONCURRENT_CONNECTIONS"))


def get_max_message_size() -> int:
    return int(os.getenv("MAX_MESSAGE_SIZE"))


def get_encoding() -> str:
    return os.getenv("ENCODING")

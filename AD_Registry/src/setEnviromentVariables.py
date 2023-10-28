import os
import dotenv

dotenv.load_dotenv()


def get_port() -> int:
    return int(os.getenv("PORT"))

def get_host():
    return os.getenv("HOST")

def get_database_file():
    return os.getenv("DATABASE_ROUTE")

def get_token_size() -> int:
    return int(os.getenv("TOKEN_SIZE"))

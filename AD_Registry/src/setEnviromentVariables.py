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


def get_max_content_length() -> int:
    return int(os.getenv("MAX_CONTENT_LENGTH"))


def get_encoding() -> str:
    return os.getenv("ENCODING")


def get_max_concurrent_connections() -> int:
    return int(os.getenv("MAX_CONCURRENT_CONNECTIONS"))


def get_http_server_port() -> int:
    return int(os.getenv("HTTP_PORT"))


def get_ssl_certificate():
    return os.getenv("SSL_CERTIFICATE")


def get_ssl_key():
    return os.getenv("SSL_KEY")

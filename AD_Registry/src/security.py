import uuid
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os
import base64
import time

import src.setEnviromentVariables as env


def generate_new_token() -> str:
    """
    Generate a new random password
    :return: str. Length: env.get_token_size()
    """
    complete_uuid = str(uuid.uuid4())
    return complete_uuid[:env.get_token_size()]


# encryption
def generate_key_pair():
    """
    Generate a new key pair
    public_exponent y key_size son valores recomendados por la documentación de cryptography
    :return:
    """
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    public_key = private_key.public_key()

    return private_key, public_key


def encrypt_data(public_key, plaintext):
    ciphertext = public_key.encrypt(
        plaintext.encode(),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return ciphertext


def decrypt_data(private_key, ciphertext):
    plaintext = private_key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return plaintext.decode()


def save_key_to_pem(key, key_type, filename, password=None):
    key_bytes = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.BestAvailableEncryption(
            password) if password else serialization.NoEncryption()
    ) if key_type == 'private' else key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    with open(filename, 'wb') as f:
        f.write(key_bytes)


def read_private_key_from_pem(file_path, password=None):
    with open(file_path, 'rb') as f:
        private_key = serialization.load_pem_private_key(
            f.read(),
            password=password,
            backend=default_backend()
        )
    return private_key


def read_public_key_from_pem(file_path):
    with open(file_path, 'rb') as f:
        public_key = serialization.load_pem_public_key(
            f.read(),
            backend=default_backend()
        )
    return public_key


def encrypt_key_base64(key: str) -> str:
    # Codificar la clave en base64
    encrypted_key = base64.b64encode(key.encode()).decode()
    return encrypted_key


def decrypt_key_base64(encrypted_key: str) -> str:
    # Decodificar la clave desde base64
    key = base64.b64decode(encrypted_key.encode()).decode()
    return key


def generate_key_aes(password, salt):
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        iterations=100000,
        salt=salt,
        length=32,
        backend=default_backend()
    )
    key = kdf.derive(password)
    return key


def encrypt_aes(key, message) -> str:
    iv = os.urandom(16)  # Initialization Vector
    cipher = Cipher(algorithms.AES(key), modes.CFB(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(message.encode()) + encryptor.finalize()
    return iv + ciphertext


def decrypt_aes(key, ciphertext) -> str:
    iv = ciphertext[:16]
    ciphertext = ciphertext[16:]
    cipher = Cipher(algorithms.AES(key), modes.CFB(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    return plaintext.decode()


def generate_temporal_token(drone_id: int) -> (str, str):
    """
    :return: str(int(token))
    """

    try:
        print("generate_temporal_token")
        current_timestamp = int(time.time())
        drone_id = int(drone_id)
        # pem_data = int(pem_data)

        clean_token = str(drone_id) + '#' + str(current_timestamp)
        print("clean_token: ", clean_token)
        ciphertext = encrypt_key_base64(clean_token)
        print("ciphertext: ", ciphertext)
        return ciphertext, current_timestamp   # se imprime un '=' al final
        #return ciphertext[len(ciphertext)-1:]
    except Exception as e:
        print("Error generating temporal token. Re-Raised: ", e)
        raise e

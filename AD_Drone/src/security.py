from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend


def encryptAES(key, data: str) -> str:
    return data

    # TODO: Encrypt data


    if key is None or key == '':
        return data
    return data


    cipher = Cipher(algorithms.AES(key), modes.ECB(), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(data) + encryptor.finalize()
    return ciphertext


def decryptAES(key, data: str) -> str:
    return data

    # TODO: Decrypt data

    if key is None or key == '':
        return data

    print(f"Decrypting data: {data}")

    cipher = Cipher(algorithms.AES(key), modes.ECB(), backend=default_backend())
    decryptor = cipher.decryptor()
    plaintext = decryptor.update(data) + decryptor.finalize()

    print(f"Decrypted data: {plaintext}")
    return plaintext

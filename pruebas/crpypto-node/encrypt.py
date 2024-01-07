from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from base64 import urlsafe_b64encode, urlsafe_b64decode
import os



def encrypt_message(message, key):
    # Generate a random initialization vector (IV)
    iv = os.urandom(16)
    
    # Pad the message to be a multiple of 16 bytes
    padder = padding.PKCS7(128).padder()
    padded_message = padder.update(message.encode('utf-8')) + padder.finalize()

    # Create an AES cipher object
    cipher = Cipher(algorithms.AES(key), modes.CFB(iv), backend=default_backend())

    # Encrypt the padded message
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded_message) + encryptor.finalize()

    # Combine IV and ciphertext and encode as base64
    result = urlsafe_b64encode(iv + ciphertext).decode('utf-8')
    return result

def decrypt_message(encrypted_message, key):
    # Decode base64 and extract IV
    decoded = urlsafe_b64decode(encrypted_message.encode('utf-8'))
    iv = decoded[:16]
    ciphertext = decoded[16:]

    # Create an AES cipher object
    cipher = Cipher(algorithms.AES(key), modes.CFB(iv), backend=default_backend())

    # Decrypt the ciphertext
    decryptor = cipher.decryptor()
    padded_message = decryptor.update(ciphertext) + decryptor.finalize()

    # Unpad the decrypted message
    unpadder = padding.PKCS7(128).unpadder()
    message = unpadder.update(padded_message) + unpadder.finalize()

    return message.decode('utf-8')

# Example usage
key = b'Sixteen byte key'
message_to_encrypt = "Hello, AES encryption!"

# Encrypt the message
encrypted_message = encrypt_message(message_to_encrypt, key)
print(f"Encrypted message: {encrypted_message}")

# Decrypt the message
decrypted_message = decrypt_message(encrypted_message, key)
print(f"Decrypted message: {decrypted_message}")

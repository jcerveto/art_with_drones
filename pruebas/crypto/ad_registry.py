# from cryptography.hazmat.primitives import serialization

with open("path/to/key.pem", "rb") as key_file:

    private_key = serialization.load_pem_private_key(

        key_file.read(),

        password=None,

    )

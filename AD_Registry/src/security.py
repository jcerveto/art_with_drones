import uuid

def generate_new_token(size: int) -> str:
    complete_uuid = str(uuid.uuid4())
    return complete_uuid[:size]


if __name__ == "__main__":
    print(generate_new_token(10))

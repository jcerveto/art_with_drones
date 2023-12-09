import uuid
import src.setEnviromentVariables as env


def generate_new_token() -> str:
    complete_uuid = str(uuid.uuid4())
    return complete_uuid[:env.get_token_size()]




if __name__ == "__main__":
    print(generate_new_token())

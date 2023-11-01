from .. import security
from .. import persistence as db


def create(entity) -> str:
    """
    :param entity: droneEntity.DroneEntity
    :return:
    """
    try:
        return db.add_drone(entity)
    except Exception as e:
        print(f"Error creating drone: {e}")
        if entity.token is None:
            raise Exception(f"Error: Can not get the token: {e}")


def update(entity) -> None:
    """
    :param entity: droneEntity.DroneEntity
    :return: None
    """
    try:
        return db.update_drone(entity)
    except Exception as e:
        print(f"Error updating drone: {e}")
        raise Exception(f"Error updating drone: {e}")


def delete(droneId: int):
    try:
        return db.delete_drone(droneId)
    except Exception as e:
        print(f"Error deleting drone: {e}")
        return False


def generate_token():
    try:
        print(f"Generating token for drone...")
        return security.generate_new_token()
    except Exception as e:
        print(f"Error generating token for drone. Impl layer. {e}")

import json

counter = 0

status = {
    "bad": '▤',
    "good": '■',
    "unknown": '□',
    "empty": '□'
}

def to_json(data: dict):
    return json.dumps(data)

def from_json(data: str):
    return json.loads(data)

def convert_to_2d_list(input_list, num_columns):
    return [input_list[i:i + num_columns] for i in range(0, len(input_list), num_columns)]


class SquareEntity:
    def __init__(self, row: int, col: int, droneStatus: str):
        self.row = row
        self.col = col
        self.status = status[droneStatus]

    def __str__(self):
        return f"{self.status}"

    def __repr__(self):
        return f"SquareEntity(row={self.row}, col={self.col}, status={self.status})"


class MapEntity:
    SIZE = 20

    def __init__(self):
        self.squares = []

    def add_square(self, square):
        self.squares.append(square)

    def __str__(self):
        buffer = ""
        new_list = convert_to_2d_list(self.squares, MapEntity.SIZE)

        # Encabezado de las columnas
        buffer += "   "
        for i in range(1, MapEntity.SIZE + 1):
            buffer += f"{i:2} "
        buffer += "\n"

        for i, row in enumerate(new_list, start=1):
            # Índice de fila
            if i < 10:
                buffer += ' '
            buffer += f"{i:1}: "
            for j, square in enumerate(row, start=1):
                buffer += str(square)
                buffer += "  "
            buffer += "\n"

        return buffer


def handle_map(message):
    global counter
    print(f"New message read from Kafka. ")
    print('*' * 50)
    print(counter)
    counter += 1
    print('*' * 50)
    print("length of message: ", len(message))
    print("type: ", type(message))  # <class 'dict'>
    print("type: ", type(message["map"]))  # <class 'str'>

    # Parse the JSON array from the message
    try:
        map_list = json.loads(message["map"])
        print("map type: ", type(map_list))  # <class 'list'>

        # Iterate through each JSON object in the array
        my_map = MapEntity()
        for obj in map_list:
            # print("Object:", obj)
            # print("type: ", type(obj))  # <class 'dict'>

            obj_valid = json.loads(obj)

            # Create a SquareEntity object
            square = SquareEntity(obj_valid.get("row", 'e'), obj_valid["col"], obj_valid["status"])
            # print("Square:", square)
            my_map.add_square(square)

        print("repr: ", repr(my_map))
        print(str(my_map))

    except json.JSONDecodeError:
        print("Error: Invalid JSON format in the 'map' field.")



### HUGO ABAJO
"""
Obtener el signo resultante de b - a

@param a: entero
@param b: entero
"""


def get_sign(a, b):
    r = b - a

    if r > 0:
        return 1
    if r < 0:
        return -1
    return 0


"""
Obtener los pasos que llevan al dron hasta un objetivo. Cada
paso es una tupla de dos elementos (x, y), y el camino resultante
es un arreglo de pasos [(x1, y1), (x2, y2)...]

@param x: entero
@param y: entero
@param end_x: entero
@param end_y: entero
"""


def get_path(x, y, end_x, end_y):
    # perdón por la recursividad
    if x == end_x and y == end_y:
        return []

    dx = get_sign(x, end_x)
    dy = get_sign(y, end_y)

    return [(dx, dy)] + get_path(x + dx, y + dy, end_x, end_y)


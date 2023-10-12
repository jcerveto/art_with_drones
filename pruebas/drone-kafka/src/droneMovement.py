import time
import utils


class DroneMovement:
    """
    Constructor

    @param identifier: entero, comprendido en [0, 99]
    @param x: entero
    @param y: entero
    """

    def __init__(self, id, x, y):
        self.id = id
        self.x = x
        self.y = y
        self.status = False

    """
    Ejecutar un movimiento unitario

    @param x: entero
    @param y: entero
    """

    def step_toward(self, dx, dy):
        if dx > 1 or dx < -1 or dy > 1 or dy < -1:
            raise Exception("Movement must be unitary")

        self.x += dx
        self.y += dy

    """
    Desplazarse hacia unas coordenadas mediante pasos unitarios

    @param x: entero
    @param y: entero
    """

    def move_to(self, x, y):
        self.status = False

        path = utils.get_path(self.x, self.y, x, y)

        while len(path) > 0:
            next_step = path.pop(0)
            self.step_toward(next_step[0], next_step[1])

            if self.x == x and self.y == y:
                self.status = True

            client.send_data(self)
            time.sleep(2)

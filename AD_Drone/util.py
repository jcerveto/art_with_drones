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

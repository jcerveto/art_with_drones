class CoordinateMovement:
    def __init__(self, row: int, col: int):
        self.row = row
        self.col = col

    def __str__(self):
        return f"({self.row}, {self.col})"

    def toDict(self):
        return {
            "row": self.row,
            "col": self.col
        }

    def __eq__(self, other):
        if isinstance(other, CoordinateMovement):
            return self.row == other.row and self.col == other.col
        return False

    def __ne__(self, other):
        return not self.__eq__(other)
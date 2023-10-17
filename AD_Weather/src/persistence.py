import csv


def get_temperature(nombre_archivo, ciudad) -> int:
    try:
        with open(nombre_archivo, 'r') as file:
            csvreader = csv.reader(file)
            for row in csvreader:
                # Comprueba si la ciudad está en la fila actual
                if row and row[0].strip().lower() == ciudad.strip().lower():
                    # Devuelve la temperatura como un entero
                    return int(row[1].strip())
            # Si la ciudad no se encuentra, devuelve -1
            return -1
    except FileNotFoundError:
        # Devuelve -1 si el archivo no se encuentra
        return 1
    except Exception as e:
        # Maneja otros errores y devuelve -1
        print(f"Error: {e}")
        return 1
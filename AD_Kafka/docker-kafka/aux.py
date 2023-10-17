def convert_to_2d_list(input_list, num_columns):
    return [input_list[i:i + num_columns] for i in range(0, len(input_list), num_columns)]

# Ejemplo de uso
input_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
num_columns = 2
output_list_2d = convert_to_2d_list(input_list, num_columns)

print(output_list_2d)

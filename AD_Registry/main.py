import os 
current_directory = os.getcwd()

# List all files and directories in the current directory
files_and_directories = os.listdir(f"{current_directory}/app")

# Print the list of files and directories
print("Files and directories in the current directory:")
for item in files_and_directories:
    print(item)
        
import sys

import src.serverEntity as serverEntity
import src.setEnviromentVariables as env


def main(argv: list):
    if len(argv) != 1:
        print(f"Usage: {argv[0]}")
        sys.exit(1)

    host = env.get_host()
    port = env.get_port()
    print("Hello World!")
    s = serverEntity.ServerEntity(host, port)
    s.start()


if __name__ == '__main__':
    main(sys.argv)

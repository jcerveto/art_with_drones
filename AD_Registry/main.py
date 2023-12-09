import os
import threading

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
import src.httpServer as httpServer


def run_http_server():
    print("Running http server... PORT: ", env.get_http_server_port())
    httpServer.app.run(debug=True, host=env.get_host(), port=env.get_http_server_port())


def main(argv: list):
    if len(argv) != 1:
        print(f"Usage: {argv[0]}")
        sys.exit(1)
    print("Hello World!")

    #http_thread = threading.Thread(target=run_http_server)
    #http_thread.start()
    run_http_server()

    #print("Running socket server...")
    #host = env.get_host()
    #port = env.get_port()
    #s = serverEntity.ServerEntity(host, port)
    #socket_thread = threading.Thread(target=s.start)
    #socket_thread.start()

    #http_thread.join()
    #socket_thread.join()
    print("Bye World!")


if __name__ == '__main__':
    main(sys.argv)

import os
import http.server
import socketserver

# Obtiene el puerto de una variable de entorno o utiliza 8000 como valor predeterminado
port = int(os.getenv("PORT", 8000))

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", port), Handler) as httpd:
    print(f"Servidor en el puerto {port}")
    # Inicia el servidor
    print("Servidor iniciado...")
    httpd.serve_forever()

# Usa la imagen oficial de Python como base
FROM python:3.9-slim

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos necesarios al contenedor
COPY app.py /app
COPY styles.css /app
COPY index.html /app
COPY script.js /app

# Expone el puerto en el que se ejecutará la aplicación
EXPOSE 8000

# Comando para ejecutar el servidor Python cuando se inicie el contenedor
CMD ["python", "app.py"]

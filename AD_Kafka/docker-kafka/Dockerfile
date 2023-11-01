# Usa una imagen oficial de Python
FROM python:3.9-slim

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de requisitos e instala las dependencias
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copia los archivos Python al contenedor
COPY consumer_kafka.py /app/
COPY producer_kafka.py /app/


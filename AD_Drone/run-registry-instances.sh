#!/bin/bash


# PARÁMETROS:
NUM_INSTANCES=$1
FIRST_ID=$2
LAST_ID=$(($FIRST_ID + $NUM_INSTANCES - 1))


# Construir la imagen de docker
sudo docker-compose build ad_drone

echo "Ejecutando $NUM_INSTANCES instancias de engine desde ID=$FIRST_ID hasta ID-$LAST_ID..."

# Bucle para crear y ejecutar las instancias en paralelo
for i in $(seq $FIRST_ID $LAST_ID); do
    echo "id: $i"
    CONTAINER_NAME="ad_drone__registry_id_$i"
    sudo docker-compose run --name $CONTAINER_NAME --rm ad_drone python app/src/runnerRegistry.py create $i drone-$i  &

    if [ $? -ne 0 ]; then
        echo "Error en la ejecución de la instancia $i. Parando el script..."
        exit 1
    fi
done

echo "Esperando a que terminen las instancias..."

exit 0  
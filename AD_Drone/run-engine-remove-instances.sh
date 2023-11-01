#!/bin/bash


# PARÁMETROS:
NUM_INSTANCES=$1
FIRST_ID=$2
LAST_ID=$(($FIRST_ID + $NUM_INSTANCES - 1))

echo "Ejecutando $NUM_INSTANCES instancias de engine desde ID=$FIRST_ID hasta ID=$LAST_ID..."



# Bucle para crear y ejecutar las instancias en paralelo
for i in $(seq $FIRST_ID $LAST_ID); do
    CONTAINER_NAME="ad_drone_engine_id_$i"
    echo "id: $CONTAINER_NAME"
    sudo docker stop $CONTAINER_NAME 
    sudo docker rm $CONTAINER_NAME

done

exit 0  
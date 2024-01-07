#!/bin/bash

#
# Instrucciones:
#
# Solicita el token temporal a AD_Registry y se une a la función de AD_Engine
#
# ./script.sh <num_instances> <first_id>

#docker-compose run ad_drone python app/src/registry.py <id>
#docker-compose run ad_drone python app/src/registry.py <id> <-s (opcional)>
#docker-compose run ad_drone python app/src/registry.py <id> <--show_map (opcional)>


# PARÁMETROS:
NUM_INSTANCES=$1
FIRST_ID=$2
LAST_ID=$(($FIRST_ID + $NUM_INSTANCES - 1))

echo "Ejecutando $NUM_INSTANCES instancias de engine desde ID=$FIRST_ID hasta ID=$LAST_ID..."

# Construir la imagen de docker
docker-compose build ad_drone

# Bucle para crear y ejecutar las instancias en paralelo
for i in $(seq $FIRST_ID $LAST_ID); do
    CONTAINER_NAME="ad_drone_engine_id_$i"
    echo "id: $CONTAINER_NAME"
    docker-compose run --name $CONTAINER_NAME --rm ad_drone python app/src/registry.py $i &

    if [ $? -ne 0 ]; then
        echo "Error en la ejecución de la instancia $i. Parando el script..."
        exit 1
    fi
done

exit 0  
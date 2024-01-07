#!/bin/bash

#
# Instrucciones:
#
# Solicita el token temporal a AD_Registry y se une a la función de AD_Engine
#

#docker-compose run ad_drone python app/src/registry.py <id>
#docker-compose run ad_drone python app/src/registry.py <id> <-s (opcional)>
#docker-compose run ad_drone python app/src/registry.py <id> <--show_map (opcional)>

docker-compose build ad_drone
docker-compose run ad_drone python app/src/registry.py $1 $2

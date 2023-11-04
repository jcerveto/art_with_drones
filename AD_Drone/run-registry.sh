#!/bin/bash

docker-compose build ad_drone

# docker-compose run ad_drone python app/src/runnerRegistry.py create 245 drone-245
docker-compose run ad_drone python app/src/runnerRegistry.py $1 $2 $3 $4

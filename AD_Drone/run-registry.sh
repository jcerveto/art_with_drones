#!/bin/bash

sudo docker-compose build ad_drone

#sudo docker-compose run ad_drone python app/src/runnerRegistry.py create 245 drone-245
sudo docker-compose run ad_drone python app/src/runnerRegistry.py $1 $2 $3 $4

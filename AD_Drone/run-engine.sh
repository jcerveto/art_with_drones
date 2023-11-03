#!/bin/bash


#docker-compose run ad_drone python app/src/runnerEngine.py 255 hash
#docker-compose run ad_drone python app/src/runnerEngine.py 255 
#docker-compose run ad_drone python app/src/runnerEngine.py 255 hash -s
#docker-compose run ad_drone python app/src/runnerEngine.py 255 -s
docker-compose run ad_drone python app/src/runnerEngine.py $1 $2 $3 $4

#!/bin/bash


#sudo docker-compose run ad_drone python app/src/runnerEngine.py 255 hash
#sudo docker-compose run ad_drone python app/src/runnerEngine.py 255 
#sudo docker-compose run ad_drone python app/src/runnerEngine.py 255 hash -s
#sudo docker-compose run ad_drone python app/src/runnerEngine.py 255 -s
sudo docker-compose run ad_drone python app/src/runnerEngine.py $1 $2 $3 $4

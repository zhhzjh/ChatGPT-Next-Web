#source .env.local
#echo $CODE
sudo docker-compose -f docker-compose-ai.yml build --no-cache
sudo docker-compose -f docker-compose-ai.yml down
sudo docker-compose -f docker-compose-ai.yml up -d


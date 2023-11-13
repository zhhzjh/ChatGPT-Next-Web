#source .env.local
#echo $CODE
sudo docker-compose -f docker-compose-try.yml build
sudo docker-compose -f docker-compose-try.yml down
sudo docker-compose -f docker-compose-try.yml up -d


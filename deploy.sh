git pull origin main

yarn install
yarn build
yarn prisma migrate deploy

sudo service restart nginx


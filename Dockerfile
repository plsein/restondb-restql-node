#Dockerfile
From node:lts

COPY ./nodejs/package.json /app/package.json

WORKDIR /app

RUN apt-get update && apt-get -y install libpq-dev gcc supervisor
RUN npm install pm2 -g
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 1M
RUN pm2 set pm2-logrotate:compress true
RUN pm2 set pm2-logrotate:rotateInterval '1 1 * * *'

EXPOSE 3000

CMD ["/app/init.sh"]

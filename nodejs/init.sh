#!/bin/bash

npm install;
# npm ci --only=production;
pm2 set pm2-logrotate:max_size 1M;
pm2 set pm2-logrotate:compress true;
pm2 set pm2-logrotate:rotateInterval '1 1 * * *';

pm2-runtime --json /app/process.yml;

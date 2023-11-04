FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY tsconfig.json tsconfig.json
COPY src src
COPY .env .env


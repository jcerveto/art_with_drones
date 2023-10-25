FROM node:18-alpine

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
RUN npm install

COPY .env /app
COPY server.js /app
COPY styles.css /app
COPY index.html /app
COPY script.js /app

EXPOSE 8000


CMD ["npm", "start"]

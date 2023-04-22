FROM node:18

WORKDIR /usr/src/torrent-search-api

COPY package*.json ./

RUN npm install

COPY server.mjs ./

COPY *.pem ./

EXPOSE 443

CMD [ "node", "server.mjs" ]
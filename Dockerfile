FROM node:19.3.0

RUN mkdir /usr/src/marsouin_bot

WORKDIR /usr/src/marsouin_bot

COPY package.json /usr/src/marsouin_bot/

RUN npm i

RUN NODE_ENV=production

COPY .env /usr/src/marsouin_bot/

COPY ./app/ /usr/src/marsouin_bot/

RUN node deployment/deploy-prod.js

CMD [ "node", "index.js" ]
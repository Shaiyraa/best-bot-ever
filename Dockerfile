FROM node:14.15.4

RUN mkdir -p /usr/src/bot-api

WORKDIR /usr/src/bot-api

COPY ./ ./

RUN npm install

CMD ["/bin/bash"]
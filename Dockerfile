FROM node:14.15.4

# Create app directory
RUN mkdir -p /usr/src/bot-api
WORKDIR /usr/src/bot-api

# Install app dependencies
COPY package.json /usr/src/bot-api
RUN npm install

# Bundle app source
COPY . /usr/src/bot-api
ENTRYPOINT npm start

EXPOSE 3000

# Build arguments
ARG NODE_VERSION=14.15.4

# Environment
ENV NODE_VERSION $NODE_VERSION
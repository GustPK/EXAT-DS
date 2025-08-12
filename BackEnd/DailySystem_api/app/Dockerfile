#FROM node:boron
FROM node:8.13-slim
#FROM node:12.18.1
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .
EXPOSE 4000
CMD [ "node", "server.js" ]
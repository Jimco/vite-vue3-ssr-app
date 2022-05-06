FROM node:14-alpine

RUN mkdir -p /app

# COPY PROJECT FILE
WORKDIR /app
COPY . .
RUN npm i axios

EXPOSE 80
CMD npm run start

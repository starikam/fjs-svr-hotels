FROM node:20.16-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
CMD [ "npm", "run", "start" ]
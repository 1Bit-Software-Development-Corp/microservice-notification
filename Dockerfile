FROM node:20.12

WORKDIR /app

COPY package.json ./
  
RUN npm install

COPY . .

ENV HOST 0.0.0.0

EXPOSE 3001

CMD ["npm", "run", "start:server"]
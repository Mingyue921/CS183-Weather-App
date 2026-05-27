FROM node:18-alpine

WORKDIR /app

COPY sever/package.json sever/package-lock.json ./

RUN npm install

COPY sever/ ./

EXPOSE 3000

CMD ["node", "src/index.js"]

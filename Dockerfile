FROM node:18-alpine

WORKDIR /app

# 先装 root 依赖（会触发 sever 里的 install）
COPY package.json package-lock.json ./
COPY sever/package.json sever/package-lock.json sever/

RUN cd sever && npm install

# 复制所有源码
COPY . .

EXPOSE 3000

CMD ["node", "sever/src/index.js"]

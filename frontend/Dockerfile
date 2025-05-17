FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000
ENV WDS_SOCKET_PORT=0
ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "start"]
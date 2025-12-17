FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Comando por defecto: ejecuta tu script 'dev' que tiene el seed + nodemon
CMD ["npm", "run", "dev"]
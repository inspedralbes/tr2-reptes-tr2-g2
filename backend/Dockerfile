FROM node:22-alpine

WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package.json package-lock.json ./

# Instala las dependencias
RUN npm install --frozen-lockfile

# Copia el resto de la aplicación
COPY . .

EXPOSE 3000

CMD ["npm", "start"]

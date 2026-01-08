FROM node:22-alpine

WORKDIR /usr/src/app

# Install bun
RUN npm install -g bun

COPY package.json bun.lock ./

# Install dependencies using bun
RUN bun install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

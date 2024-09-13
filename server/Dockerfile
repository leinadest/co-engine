# Develop stage
FROM node:20-slim AS dev

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD ["npm", "run", "dev"]

# Migration stage
FROM node:20-slim AS migration

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ENV POSTGRES_URL=postgresql://postgres:example@postgres:5432
ENV MONGO_URL=mongodb://root:example@mongo:27017/?directConnection=true

CMD ["sh", "-c", "npm run migrate:up && npm run seed"]

# Build stage
FROM node:20 AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:20-slim AS prod

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/package-lock.json ./package-lock.json

RUN npm ci --only=production

USER node

EXPOSE 4000

CMD ["npm", "start"]

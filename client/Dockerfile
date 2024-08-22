# Build stage
FROM node:20 AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

# Develop stage
FROM node:20-alpine AS base

WORKDIR /usr/src/app

COPY --chown=node:node --from=builder /usr/src/app .

USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]

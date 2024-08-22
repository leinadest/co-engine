# Build stage
FROM node:20 AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

# Develop stage
FROM node:20-slim AS base

WORKDIR /usr/src/app

COPY --chown=node:node --from=builder /usr/src/app .

USER node

EXPOSE 4000

CMD ["npm", "start"]
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

COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY --chown=node:node --from=builder /usr/src/app/package.json ./package.json
COPY --chown=node:node --from=builder /usr/src/app/package-lock.json ./package-lock.json

RUN npm ci --only=production

USER node

EXPOSE 4000

CMD ["npm", "start"]
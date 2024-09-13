FROM mcr.microsoft.com/playwright:v1.47.0-noble

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD ["npm", "run", "test"]

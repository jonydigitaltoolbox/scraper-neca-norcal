FROM apify/actor-node-playwright-chrome:latest

COPY package*.json ./
RUN npm ci --only=production

COPY . ./

CMD ["node", "main.js"]
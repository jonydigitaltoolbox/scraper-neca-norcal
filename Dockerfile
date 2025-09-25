# Use GHCR to avoid Docker Hub auth/rate-limit issues
FROM ghcr.io/apify/actor-node-playwright-chrome:latest

# Speed up installs; prune dev deps
COPY package*.json ./
RUN npm ci --only=production

COPY . ./

CMD ["node", "main.js"]

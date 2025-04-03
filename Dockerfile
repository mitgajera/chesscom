# Chess App Dockerfile
FROM node:18-alpine AS client-builder
WORKDIR /app/client

# Copy and build client
COPY chess-client/package*.json ./
RUN npm install
COPY chess-client/ ./
RUN npm run build

# Setup server with client build
FROM node:18-alpine
WORKDIR /app
COPY chess-server/package*.json ./
RUN npm install --production
COPY chess-server/ ./
COPY --from=client-builder /app/client/dist ./public

# Configuration
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
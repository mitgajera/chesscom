# Stage 1: Build the React client
FROM node:18-alpine AS client-builder
WORKDIR /app/client

# Copy client package files and install dependencies
COPY chess-client/package*.json ./
RUN npm install

# Copy client source code
COPY chess-client/ ./

# Build the client application
RUN npm run build

# Stage 2: Set up the server
FROM node:18-alpine
WORKDIR /app

# Copy server package files and install production dependencies
COPY chess-server/package*.json ./
RUN npm install --production

# Copy server source code
COPY chess-server/ ./

# Copy the built client files to the server's public directory
COPY --from=client-builder /app/client/dist ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
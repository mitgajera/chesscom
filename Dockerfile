# Stage 1: Build the chess-client
FROM node:18-alpine AS client-build
WORKDIR /app/chess-client
COPY chess-client/package*.json ./
RUN npm install
COPY chess-client/ ./
RUN npm run build

# Stage 2: Build the chess-server
FROM node:18-alpine AS server-build
WORKDIR /app/chess-server
COPY chess-server/package*.json ./
RUN npm install
COPY chess-server/ ./

# Stage 3: Final stage
FROM node:18-alpine
WORKDIR /app
COPY --from=client-build /app/chess-client/dist ./dist
COPY --from=server-build /app/chess-server ./
RUN npm install --production
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["node", "server.js"]
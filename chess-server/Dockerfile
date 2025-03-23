# Use Node.js LTS as the base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy server code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Run the server
CMD ["node", "server.js"]
# Use official Node.js LTS as base image
FROM node:20-alpine

# Install build dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    sqlite-dev

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies with rebuild for alpine
RUN npm install --production && npm rebuild

# Copy the rest of the application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads qrcodes

# Expose the port your server runs on
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the server
CMD ["node", "server.js"]
# Use official Node.js LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port your server runs on (assume 3000; change if different)
EXPOSE 3000

# Environment variables (set these in Render dashboard)
ENV NODE_ENV=production
ENV PORT=3000

# Start the server (adjust if your start command is different, e.g., "node index.js" or "npm start")
CMD ["node", "server.js"]
# Use the official Node.js 18 image on Alpine Linux
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json from the 'server' subdirectory
COPY server/package*.json ./

# Install the server's dependencies
RUN npm install

# Copy the rest of the application's source code from the 'server' subdirectory
COPY server/ .

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the application
CMD ["npm", "start"]
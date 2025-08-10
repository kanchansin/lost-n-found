# /server/Dockerfile

FROM node:18-alpine

WORKDIR /app

# Copy the package files from the 'server' subdirectory of the build context
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code from the 'server' subdirectory
COPY server/ .

EXPOSE 8080
CMD ["npm", "start"]
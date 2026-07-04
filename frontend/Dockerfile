# Use official Node runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies first (cached layer)
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Build the Next.js application for production
RUN npm run build

# Expose Next.js default port
EXPOSE 3000

# Start Next.js production server
CMD ["npm", "run", "start"]

# Set the base image for the Node.js app
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files into the container
COPY . .

# Expose the port the app will run on
EXPOSE 3001

# Start the application
CMD ["node", "index.js"]

FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package definition files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose backend service port
EXPOSE 5000

# Start backend application
CMD ["npm", "start"]

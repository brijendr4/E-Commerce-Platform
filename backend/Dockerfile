FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install exact dependencies
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Backend port
EXPOSE 5000

# Start backend
CMD ["npm", "start"]
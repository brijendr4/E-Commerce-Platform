FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install exact production dependencies only (no devDeps in image)
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Backend port
EXPOSE 5000

# Run as non-root for least-privilege security
USER node

# Start backend
CMD ["npm", "start"]
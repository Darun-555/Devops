# Step 1: Choose base image
FROM node:18-alpine

# Step 2: Add metadata
LABEL maintainer="Darun-555"

# Step 3: Set working directory inside container
WORKDIR /app

# Step 4: Copy dependency files first (enables layer caching)
COPY package*.json ./

# Step 5: Install only production dependencies
RUN npm ci --only=production

# Step 6: Copy the rest of your source code
COPY . .

# Step 7: Copy environment example (never commit real .env to Docker)
COPY .env.example .env.example

# Step 8: Expose the port your server listens on
EXPOSE 3000

# Step 9: Run as non-root user for security
USER node

# Step 10: Start the server
CMD ["node", "server.js"]

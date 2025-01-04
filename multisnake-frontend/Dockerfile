# Build stage, we need to give it a name because we need to reference it later
# for copying the /dist directory from this stage to the deployment stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production/deployment stage
FROM nginx:alpine

# Copy built files from builder stage to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Don't run nginx as daemon in background, instead as foreground process
# This way the container stays alive and we can see the nginx logs
CMD ["nginx", "-g", "daemon off;"]

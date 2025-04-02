FROM node:18-alpine AS builder

# Copy the server code and tsconfig
COPY . /app
WORKDIR /app

# Install dependencies with caching
RUN --mount=type=cache,target=/root/.npm npm install

# Build the application
RUN npm run build

# Production stage with minimal dependencies
FROM node:18-alpine AS release

# Copy only the necessary files from the builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install only production dependencies
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts --omit=dev

# Run the server
ENTRYPOINT ["node", "dist/index.js"]
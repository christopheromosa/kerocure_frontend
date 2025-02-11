# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and lockfile
COPY package.json pnpm-lock.yaml ./

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the code
COPY . . 

# Build Next.js app
RUN pnpm run build

# Stage 2: Serve the application
FROM node:18-alpine
WORKDIR /app

# Install pnpm globally in the runtime image
RUN npm install -g pnpm

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public


# Expose the Next.js port
EXPOSE 3000

# Use Next.js production server
CMD ["pnpm", "start"]

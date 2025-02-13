# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm globally (Do this FIRST)
RUN npm install -g pnpm

# Copy package.json and lockfile (Do this BEFORE pnpm install)
COPY package.json pnpm-lock.yaml ./ 

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the code (Do this AFTER pnpm install)
COPY . .

# Build Next.js app
RUN pnpm run build

# Stage 2: Serve the application
FROM node:18-alpine
WORKDIR /app

# Install pnpm globally (Also needed in the runtime stage)
RUN npm install -g pnpm

# Copy necessary files from builder (Correct and efficient)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the Next.js port
EXPOSE 3000

# Use Next.js production server
CMD ["pnpm", "start"]
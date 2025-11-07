# Development Dockerfile with hot reload
FROM oven/bun:1 AS development

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Expose port
EXPOSE 8080

# Run in dev mode with hot reload
CMD ["bun", "run", "dev"]

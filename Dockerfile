# ---------- Build Stage ----------
FROM --platform=linux/amd64 node:20-slim AS builder

WORKDIR /app

# Install system dependencies including OpenSSL
RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@8.10.2

# Copy and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client and build app
RUN npx prisma generate
RUN pnpm build

# ---------- Production Stage ----------
FROM --platform=linux/amd64 node:20-slim AS production

WORKDIR /app

# Install system dependencies including OpenSSL
RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@8.10.2

# Copy only what's needed from the builder
COPY package.json pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client in production
RUN npx prisma generate

# Expose app port
EXPOSE 3000

# Start the app
CMD ["pnpm", "run", "start:prod"]
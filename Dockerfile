  ###################
  # BUILD STAGE
  ###################
  FROM node:20-alpine AS builder

  WORKDIR /app
  
  # Install pnpm and required build tools
  RUN npm install -g pnpm
  
  # Copy and install deps
  COPY package.json pnpm-lock.yaml ./
  RUN pnpm install --no-frozen-lockfile
  
  # Copy rest of the app
  COPY . .
  
  # Generate Prisma and build app
  RUN npx prisma generate && pnpm build
  
  ###################
  # PRODUCTION STAGE
  ###################
  
  FROM node:20-alpine AS production
  
  WORKDIR /app
  
  # Copy package files and built native modules from builder
  COPY package.json pnpm-lock.yaml ./
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/prisma ./prisma
  COPY --from=builder /app/dist ./dist
  
  # Generate Prisma client in production
  RUN npx prisma generate
  
  EXPOSE 3000
  
CMD ["pnpm", "run", "start:prod"]
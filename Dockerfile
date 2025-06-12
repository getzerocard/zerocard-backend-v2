  ###################
  # BUILD STAGE
  ###################
  FROM --platform=linux/amd64 node:20-alpine AS builder

  WORKDIR /app
  
  # Install pnpm
  RUN npm install -g pnpm
  
  # Copy package files
  COPY package.json pnpm-lock.yaml ./
  
  # Install dependencies
  RUN pnpm install --frozen-lockfile
  
  # Copy rest of the app
  COPY . .
  
  # Generate Prisma and build app
  RUN npx prisma generate && pnpm build
  
  ###################
  # PRODUCTION STAGE
  ###################
  
  FROM --platform=linux/amd64 node:20-alpine AS production
  
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
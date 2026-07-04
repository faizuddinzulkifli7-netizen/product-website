# syntax=docker/dockerfile:1

# ---- Builder ----
# Compiles TypeScript and native modules (bcrypt, sqlite3).
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production dependencies ----
# Native modules are recompiled here so only prod deps ship in the image.
FROM node:22-alpine AS prod-deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Runner ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/database.sqlite

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Persist the SQLite database outside the image layer.
RUN mkdir -p /app/data && chown -R nestjs:nodejs /app/data

USER nestjs
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]

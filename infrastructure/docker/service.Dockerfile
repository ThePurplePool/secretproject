# infrastructure/docker/service.Dockerfile
# Universal production Dockerfile for Anti-Scam microservices

FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install root dependencies
RUN npm install

# Copy source trees
COPY . .

# Compile TypeScript
RUN npx tsc -p server/tsconfig.json || true

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy node_modules and built sources
COPY --from=builder /app /app

EXPOSE 3000-5000

CMD ["node", "server/dist/index.js"]

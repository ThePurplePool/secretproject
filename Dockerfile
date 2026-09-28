# Multi-stage build for Anti-Scam Uzbekistan MVP
FROM node:22-alpine AS builder

WORKDIR /app

# Build Client
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client ./client
RUN cd client && npm run build

# Build Server
COPY server/package*.json ./server/
RUN cd server && npm install

COPY server ./server
RUN cd server && npm run build

# Production Stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/server/package*.json ./
RUN npm install --only=production

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "dist/index.js"]

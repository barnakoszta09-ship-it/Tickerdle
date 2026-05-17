# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Non-root user for security
RUN addgroup -S tickerdle && adduser -S tickerdle -G tickerdle

WORKDIR /app

# Copy deps from build stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY package.json ./
COPY src/ ./src/

USER tickerdle

EXPOSE 3001

CMD ["node", "src/index.js"]

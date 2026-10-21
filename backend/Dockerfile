# Stage 1: Install production dependencies
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: Minimal non-root production runtime
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Ensure app directory and uploads are owned by node user
RUN mkdir -p uploads && chown -R node:node /app

# Copy production node_modules and package definitions with non-root ownership
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./

# Copy application source code with non-root ownership
COPY --chown=node:node . .

# Run as non-root user (UID 1000) for security
USER node

EXPOSE 4000

CMD ["node", "server.js"]

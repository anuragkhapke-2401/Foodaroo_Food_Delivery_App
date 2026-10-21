# Stage 1: Install dependencies and build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci 

COPY . .

RUN npm run build 

# Stage 2: Minimal non-root runtime image
FROM nginxinc/nginx-unprivileged:alpine 

COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html

COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

# Explicitly declare non-root user (UID 101)
USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

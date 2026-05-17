# Dockerfile (root) — builds the Vite frontend into a static /dist folder.
#
# This is only needed if you want a Docker image for the frontend build step.
# For normal VPS deploys, deploy.sh runs `npm run build` directly on the host.
#
# Build:
#   docker build -t tickerdle-frontend --build-arg VITE_API_URL="" .
#   docker cp $(docker create tickerdle-frontend):/app/dist ./dist
#
# Or use the output as a base for an nginx container:
#   FROM tickerdle-frontend AS build
#   FROM nginx:alpine
#   COPY --from=build /app/dist /usr/share/nginx/html

FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (layer-cached if package*.json unchanged)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# VITE_API_URL="" means /api/* paths — correct for same-origin nginx setup.
# Pass --build-arg VITE_API_URL=https://api.example.com to override.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Output stage ──────────────────────────────────────────────────────────────
# A minimal image containing only /app/dist.  Use `docker cp` or a named
# volume to extract the build artefact without running nginx in Docker.
FROM scratch AS dist
COPY --from=build /app/dist /dist

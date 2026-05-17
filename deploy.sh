#!/usr/bin/env bash
# deploy.sh — zero-downtime redeploy for tickerdle.org
#
# Prerequisites (one-time, see README):
#   - Node 20+, npm, PM2, rsync installed on the VPS
#   - /opt/tickerdle is the git checkout root (this file lives there)
#   - /var/www/tickerdle/dist is the nginx web root
#   - server/.env exists and is populated
#
# Usage:
#   ./deploy.sh              # pull main, build, reload
#   ./deploy.sh --skip-pull  # rebuild without pulling (useful for config-only changes)

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_SRC="$APP_DIR/dist"
DIST_DEST="/var/www/tickerdle/dist"
SERVER_DIR="$APP_DIR/server"
BRANCH="main"
SKIP_PULL=false

for arg in "$@"; do
  case $arg in
    --skip-pull) SKIP_PULL=true ;;
    --branch=*)  BRANCH="${arg#*=}" ;;
  esac
done

log()  { echo -e "\033[1;32m[deploy]\033[0m $*"; }
warn() { echo -e "\033[1;33m[deploy]\033[0m $*"; }
fail() { echo -e "\033[1;31m[deploy]\033[0m $*" >&2; exit 1; }

# ── 1. Pull latest code ───────────────────────────────────────────────────────
if [ "$SKIP_PULL" = false ]; then
  log "Pulling $BRANCH..."
  git -C "$APP_DIR" fetch --prune origin
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
fi

# ── 2. Install / update frontend dependencies ─────────────────────────────────
log "Installing frontend dependencies..."
npm ci --prefix "$APP_DIR" --silent

# ── 3. Build Vite frontend ────────────────────────────────────────────────────
# VITE_API_URL is intentionally empty — nginx serves frontend and proxies
# /api/* to the Node backend on the same origin.
log "Building frontend..."
VITE_API_URL="" npm run build --prefix "$APP_DIR"

# ── 4. Atomic sync dist → nginx web root ──────────────────────────────────────
log "Syncing build output to $DIST_DEST..."
mkdir -p "$DIST_DEST"
rsync -a --delete --checksum "$DIST_SRC/" "$DIST_DEST/"

# ── 5. Install / update backend dependencies ──────────────────────────────────
log "Installing backend dependencies..."
npm ci --prefix "$SERVER_DIR" --omit=dev --silent

# ── 6. Reload or start backend via PM2 ────────────────────────────────────────
log "Reloading backend (PM2)..."
cd "$SERVER_DIR"
if pm2 id tickerdle-server &>/dev/null; then
  pm2 reload ecosystem.config.js --env production --update-env
else
  pm2 start ecosystem.config.js --env production
  pm2 save  # persist process list across reboots
fi

# ── 7. Health check ───────────────────────────────────────────────────────────
log "Waiting for backend to settle..."
sleep 2

HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" http://localhost:3001/api/health)
if [ "$HTTP_CODE" = "200" ]; then
  TICKER_HINT=$(curl -sf http://localhost:3001/api/health | grep -o '"ticker":"[^"]*"' | cut -d'"' -f4)
  log "✓ Backend healthy — today's ticker is $TICKER_HINT"
else
  warn "Health check returned HTTP $HTTP_CODE — check 'pm2 logs tickerdle-server'"
fi

log "✓ Deploy complete — $(date)"

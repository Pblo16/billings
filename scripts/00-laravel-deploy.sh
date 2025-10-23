#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

echo "[deploy] Downloading frontend assets from GitHub Actions..."
bash /var/www/html/scripts/download-assets.sh

echo "[deploy] Installing Composer dependencies (no-dev, optimized autoloader)"
composer install --no-interaction --no-dev --prefer-dist --no-progress --optimize-autoloader

echo "[deploy] Ensuring app key exists"
if ! php -r 'echo empty(env("APP_KEY")) ? "missing" : "ok";' | grep -q ok; then
  php artisan key:generate --force
fi

echo "[deploy] Ensuring writable directories and storage symlink"
mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache database
touch database/database.sqlite || true
php artisan storage:link || true
chmod -R ug+rwX storage bootstrap/cache || true

echo "[deploy] Clearing caches"
php artisan optimize:clear

echo "[deploy] Running migrations (force)"
php artisan migrate --force

echo "[deploy] Seeding database (force)"
php artisan db:seed --force || true

echo "[deploy] Applying application permissions"
php artisan app:permissions || true

echo "[deploy] Caching configuration, routes, events and views"
php artisan optimize

echo "[deploy] Listing routes (sanity check)"
php artisan route:list || true

echo "[deploy] Verifying frontend assets directory..."
if [ ! -d /var/www/html/public/build/assets ]; then
  echo "ERROR: Frontend assets directory not found! Did you run pnpm build in CI?"
  exit 1
fi

echo "[deploy] Deployment completed!"
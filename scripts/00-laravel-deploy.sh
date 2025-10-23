#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

echo "[deploy] Downloading frontend assets from GitHub Actions..."
bash /var/www/html/scripts/download-assets.sh

echo "[deploy] Installing Composer dependencies (no-dev, optimized autoloader)"
composer install --no-interaction --no-dev --prefer-dist --no-progress --optimize-autoloader

echo "[deploy] Ensuring writable directories and storage symlink"
mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache
php artisan storage:link || true
chmod -R ug+rwX storage bootstrap/cache || true

echo "[deploy] Running migrations (force)"
php artisan migrate --force

echo "[deploy] Seeding database (force)"
php artisan db:seed --force || true

echo "[deploy] Applying application permissions"
php artisan app:permissions || true

echo "[deploy] Caching configuration, routes, events and views"
php artisan optimize

echo "[deploy] Deployment completed!"
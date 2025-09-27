#!/usr/bin/env bash
echo "Running composer"
composer install --no-dev --working-dir=/var/www/html

pnpm install
pnpm run build

echo "Clearing all caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Running migrations..."
php artisan migrate --force

echo "Seeding database..."
php artisan db:seed --force

echo "Listing routes..."
php artisan route:list 

echo "Deployment completed!"
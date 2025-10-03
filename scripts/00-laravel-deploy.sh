#!/usr/bin/env bash

echo "Running composer"
composer install --no-dev --working-dir=/var/www/html

echo "Clearing all caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Running migrations..."
php artisan migrate

echo "Seeding database..."
php artisan db:seed

echo "Permissions..."
php artisan app:permissions 


echo "Listing routes..."
php artisan route:list 

echo "Verifying frontend assets directory..."
if [ ! -d /var/www/html/public/build/assets ]; then
  echo "ERROR: Frontend assets directory not found! Did you run pnpm build in CI?"
  exit 1
fi

echo "Deployment completed!"
#!/usr/bin/env bash
echo "Running composer"
composer install --no-dev --working-dir=/var/www/html

echo "Clearing caches..."
php artisan config:clear
php artisan view:clear
php artisan route:clear

echo "Running migrations..."
php artisan migrate --force

echo "Seeding database..."
php artisan db:seed --force

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Caching views..."
php artisan view:cache

echo "Deploy completed successfully!"
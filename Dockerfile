# Stage 1 - Build Frontend (Vite)
FROM node:22 AS frontend
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar resto del código y compilar
COPY . .
RUN npm run build

# Stage 2 - Backend (Laravel + PHP + Composer)
FROM php:8.3-fpm AS backend

# Instalar dependencias del sistema y extensiones PHP
RUN apt-get update && apt-get install -y \
    git curl unzip libpq-dev libonig-dev libzip-dev zip \
    && docker-php-ext-install pdo pdo_mysql mbstring zip \
    && rm -rf /var/lib/apt/lists/*

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copiar archivos del proyecto
COPY . .

# Copiar build del frontend
COPY --from=frontend /app/dist ./public/dist

# Instalar dependencias de PHP para producción
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Optimizar Laravel
RUN php artisan config:clear \
    && php artisan route:clear \
    && php artisan view:clear \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

CMD ["php-fpm"]

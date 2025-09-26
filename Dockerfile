# Stage 1 - Build Frontend (Vite + pnpm)
FROM node:22 AS frontend
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar dependencias y lockfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar el resto del proyecto y hacer build
COPY . .

# Forzar APP_ENV para que no falle vite-plugin-wayfinder
ENV APP_ENV=production
ENV APP_URL=http://localhost

RUN pnpm build

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

# Copiar código de la app
COPY . .

# El build de Vite ya está en public/build desde el stage 1
COPY --from=frontend /app/public/build ./public/build

# Instalar dependencias de PHP para producción
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Optimizar caches de Laravel
RUN php artisan config:clear \
    && php artisan route:clear \
    && php artisan view:clear \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

CMD ["php-fpm"]

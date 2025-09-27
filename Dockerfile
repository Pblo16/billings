# Dockerfile siguiendo la documentación oficial de Render
FROM richarvey/nginx-php-fpm:3.1.6

# Configuración de imagen según documentación Render
ENV SKIP_COMPOSER=1
ENV WEBROOT=/var/www/html/public
ENV PHP_ERRORS_STDERR=1
ENV RUN_SCRIPTS=1
ENV REAL_IP_HEADER=1

# Configuración Laravel
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr

# Permitir composer como root
ENV COMPOSER_ALLOW_SUPERUSER=1

# Copiar código de la aplicación
COPY . /var/www/html

# Instalar extensiones PHP que podrían faltar
RUN apk add --no-cache postgresql-dev && docker-php-ext-install pdo_pgsql

# Instalar dependencias de PHP para producción
RUN cd /var/www/html && composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Ajustar permisos
RUN chown -R nginx:nginx /var/www/html && \
    chmod -R 755 /var/www/html/storage && \
    chmod -R 755 /var/www/html/bootstrap/cache

# Crear directorios de storage si no existen
RUN mkdir -p /var/www/html/storage/logs && \
    mkdir -p /var/www/html/storage/framework/{cache,sessions,views} && \
    chown -R nginx:nginx /var/www/html/storage

# Copiar y hacer ejecutable el script de deploy
COPY deploy.sh /opt/deploy.sh
RUN chmod +x /opt/deploy.sh

CMD ["/start.sh"]
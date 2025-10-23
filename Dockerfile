FROM richarvey/nginx-php-fpm:3.1.6

# Instalar herramientas necesarias para el deploy script
RUN apk add --no-cache curl jq unzip postgresql-dev && \
    docker-php-ext-install pdo_pgsql

# Copiar configuración de nginx
COPY conf/nginx-site.conf /etc/nginx/sites-available/default.conf

COPY . .

# Image config
ENV SKIP_COMPOSER 1
ENV WEBROOT /var/www/html/public
ENV PHP_ERRORS_STDERR 1
ENV RUN_SCRIPTS 1
ENV REAL_IP_HEADER 1

# Laravel config
ENV APP_ENV production
ENV APP_DEBUG false
ENV LOG_CHANNEL stderr

# Allow composer to run as root
ENV COMPOSER_ALLOW_SUPERUSER 1

CMD ["/start.sh"]
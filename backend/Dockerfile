FROM php:8.3-cli

WORKDIR /app

RUN apt-get update && apt-get install -y \
	git unzip libzip-dev libicu-dev libxml2-dev libonig-dev \
	libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
	&& docker-php-ext-configure gd --with-freetype --with-jpeg \
	&& docker-php-ext-install pdo_mysql bcmath mbstring xml intl zip gd exif \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist \
	&& mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
	&& chown -R www-data:www-data storage bootstrap/cache

ENV SESSION_DRIVER=file
ENV CACHE_STORE=file

EXPOSE 10000

CMD ["sh", "-c", "SESSION_DRIVER=file CACHE_STORE=file php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]

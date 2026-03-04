FROM php:8.2-cli

WORKDIR /app

RUN apt-get update && apt-get install -y git unzip libzip-dev libicu-dev libxml2-dev libonig-dev \
	&& docker-php-ext-install pdo_mysql bcmath mbstring xml intl zip \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist \
	&& chown -R www-data:www-data storage bootstrap/cache

EXPOSE 10000

CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]

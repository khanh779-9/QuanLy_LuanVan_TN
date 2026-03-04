FROM php:8.2-apache

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
	git \
	unzip \
	libzip-dev \
	libicu-dev \
	libpng-dev \
	libjpeg62-turbo-dev \
	libfreetype6-dev \
	libxml2-dev \
	libonig-dev \
	libcurl4-openssl-dev \
	&& docker-php-ext-configure gd --with-freetype --with-jpeg \
	&& docker-php-ext-install -j"$(nproc)" \
		pdo_mysql \
		bcmath \
		mbstring \
		xml \
		intl \
		zip \
		gd \
		exif \
		pcntl \
	&& a2enmod rewrite \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist \
	&& chown -R www-data:www-data storage bootstrap/cache

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
	&& sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

EXPOSE 10000

CMD ["sh", "-c", "PORT=${PORT:-10000}; sed -ri \"s/Listen 80/Listen ${PORT}/\" /etc/apache2/ports.conf; sed -ri \"s/:80>/:${PORT}>/\" /etc/apache2/sites-available/000-default.conf; apache2-foreground"]

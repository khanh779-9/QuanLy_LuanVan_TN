# Backend - Quản lý luận văn tốt nghiệp

API backend được xây bằng Laravel 12 (PHP 8.2+).

## Chạy local

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

API base URL: `http://127.0.0.1:8000/api`

## Cấu hình cần sửa trong `.env`

- `APP_URL`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

## Deploy Render (Docker)

- Dùng `Dockerfile` trong thư mục `backend`.
- Có thể dùng `render.yaml` ở thư mục gốc để tạo service nhanh.
- Nhớ khai báo biến môi trường production (đặc biệt: `APP_KEY`, `APP_URL`, `DB_*`).

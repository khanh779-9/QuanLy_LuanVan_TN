# Lar_Monopre - Tách cứng BE/FE (đều dùng Laravel)

## Cấu trúc

- `backend/`: Laravel Backend (API + xử lý logic + dữ liệu).
- `frontend/`: Laravel Frontend (giao diện, gọi API từ backend).

## Chạy Backend

```bash
cd backend
php artisan serve --port=8000
```

Backend API base: `http://127.0.0.1:8000/api`

## Chạy Frontend

```bash
cd frontend
php artisan serve --port=8001
```

Frontend URL: `http://127.0.0.1:8001`

## FE gọi BE API

Sửa URL trong `frontend/public/config.js`:

```js
window.APP_CONFIG = {
    API_BASE_URL: 'http://127.0.0.1:8000/api'
};
```

## Luồng hiện tại

- `frontend` route `/` chuyển đến `login.html`.
- `login.html` gọi `POST /api/login`.
- `dashboard.html` gọi `GET /api/dashboard`.

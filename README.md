# Quản lý luận văn tốt nghiệp

| MSSV       | Họ ên            | Lớp     |
| ---------- | ------------------ | -------- |
| DH52111470 | Lê Tiến Phát    | D22_TH01 |
| DH52200332 | Nguyễn Tuấn Anh  | D22_TH08 |
| DH52201225 | Võ Thiên Phú    | D22_TH08 |
| DH52200887 | Trần Quốc Khánh | D22_TH15 |
| DH52201264 | Hồ Khôil Phục   | D22_TH15 |
| LT05250031 | Siêu Ngọc Tài   | L25_TH01 |

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

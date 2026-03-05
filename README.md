# Quản lý luận văn tốt nghiệp

## Thành viên

| MSSV       | Họ tên           | Lớp     |
| ---------- | ------------------ | -------- |
| DH52111470 | Lê Tiến Phát    | D22_TH01 |
| DH52200332 | Nguyễn Tuấn Anh  | D22_TH08 |
| DH52201225 | Võ Thiên Phú    | D22_TH08 |
| DH52200887 | Trần Quốc Khánh | D22_TH15 |
| DH52201264 | Hồ Khôi Phục    | D22_TH15 |
| LT05250031 | Siêu Ngọc Tài   | L25_TH01 |

## Cấu trúc dự án

- `backend/`: Laravel API.
- `frontend/`: Giao diện người dùng.

## Thông tin chi tiết

- Backend: xem [backend/README.md](backend/readme.md)
- Frontend: xem [frontend/README.md](frontend/readme.md)

## Chạy nhanh local

Backend:

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

API base URL: `http://127.0.0.1:8000/api` (chỉ test trên local)

Trong môi trường mạng https://quanly-luanvan-tn-backend.onrender.com

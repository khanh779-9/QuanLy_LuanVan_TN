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

## Phân công cv

| STT | Thành viên                 | Vai trò              | Công việc chính                                                                                                                         |
| --- | ---------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Trần Quốc Khánh** | Team Leader + Backend | Chuyển đổi, database, API, authentication (login/logout), phân quyền (admin/giảng viên/sinh viên)                                 |
| 2   | **Lê Tiến Phát**    | Backend Developer     | Xây dựng & check module **quản lý đề tài luận văn** (CRUD), các API, chức năng duyệt hoặc từ chối đề tài           |
| 3   | **Nguyễn Tuấn Anh**  | Frontend Developer    | Tạo giao diện **dự trên mẫu cũ**, bảng danh sách sinh viên, kết nối API sinh viên |
| 4   | **Võ Thiên Phú**    | Frontend Developer    | Tinh chỉnh giao diện, responsive, layout hệ thống (Navbar, Sidebar), kết nối API đăng nhập, phối hợp với Tuấn ANh                                        |
| 5   | **Hồ Khôi Phục**    | Frontend Developer    | Tinh chỉnh giao diện, kiểm tra hoạt động chức năng **search, filter, pagination, ...**, kết nối API liên quan, phối hợp với Tuấn Anh                  |
| 6   | **Siêu Ngọc Tài**   | DevOps + Tester       | Kiểm tra các câu hình **Docker, Web, môi trường (.env)**, kiểm thử API và giao diện, viết **README, tài liệu cài đặt** và nhắn lại nhóm nếu có sai xót cần sửa |

- Lưu ý, cả BE và FE phải push kèm file ``.env.example`` và bổ sung nội dung cho file ``readme.md`` trong BE hoặc FE

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

Trong môi trường mạng `https://quanly-luanvan-tn-backend-ae78.onrender.com`

Link BE dự phòng: `https://quanlyluanvantnbackend-production.up.railway.app`

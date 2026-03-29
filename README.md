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
| 1   | **Trần Quốc Khánh** | Team Leader + Backend | Chuyển đổi, xây dựng database, API, auth/permission, các module (CRUD)                                                              |
| 2   | **Lê Tiến Phát**    | Backend Developer     | Kiểm tra, sửa lỗi và hoàn thiện các module, API, xử lí import/export file                                                         |
| 3   | **Nguyễn Tuấn Anh**  | Frontend Developer    | Dựng layout, routing, kết nối API, làm các trang chính và luồng điều hướng                                                     |
| 4   | **Võ Thiên Phú**    | Frontend Developer    | Làm các màn hình form, bảng danh sách, modal, responsive, tối ưu UI/UX                                                             |
| 5   | **Hồ Khôi Phục**    | Frontend Developer    | Kiểm tra hoạt động chức năng**search, filter, pagination, ...** test luồng thao tác, fix bug FE                            |
| 6   | **Siêu Ngọc Tài**   | DevOps + Tester       | Kiểm tra các câu hình**Docker, Web, môi trường (.env)**, kiểm thử API và UI, viết **README, tài liệu cài đặt** |

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

## Backend
- API base URL: `http://127.0.0.1:8000/api` (chỉ test trên local)
- Trong môi trường mạng `https://quanly-luanvan-tn-backend-ae78.onrender.com`
- Link BE dự phòng: `https://quanlyluanvantnbackend-production.up.railway.app`

## Frontend
- Link frontend: `https://quan-ly-luan-van-tn.vercel.app`

## Thông tin tài khoản test
![Acc_Image](screenshot/image.png)

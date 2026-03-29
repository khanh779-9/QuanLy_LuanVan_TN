# Frontend

# Quản lý Luận Văn Tốt Nghiệp - Frontend

## Tổng quan

Đây là mã nguồn Frontend (React + Vite) cho hệ thống Quản lý Luận Văn Tốt Nghiệp. Ứng dụng này giao tiếp với Backend qua API và được phát triển mới, hiện đại hóa so với project cũ (PHP thuần).

## Các trang/chức năng đã hoàn thành

- [X] Đăng nhập (LoginPage.jsx)
- [X] Dashboard tổng quan (Dashboard.jsx)
- [X] Quản lý Users (UsersPage.jsx)
- [X] Quản lý đề tài (ThesisList.jsx, ThesisFormModal.jsx)
- [X] Quản lý phân công đề tài cho GVHD, GVPB (Assignment.jsx)
- [X] Quản lý hội đồng (Council.jsx)
- [X] Quản lý dữ liệu (DataManagement.jsx)
- [X] Chấm điểm giữa kỳ (Midterm.jsx)
- [X] Chấm điểm phản biện (Review.jsx)
- [X] Xem chi tiết luận văn (ThesisDetail.jsx)

## Chức năng đang phát triển/đang làm

- [ ] Quản lý sinh viên chi tiết (tách riêng)
- [ ] Quản lý hồ sơ luận văn (nâng cao)
- [ ] Thống kê nâng cao, xuất file
- [ ] Giao diện mobile/responsive tối ưu hơn

## Chức năng chưa làm/định hướng

- [ ] Quản lý điểm chi tiết từng thành viên hội đồng
- [ ] Tích hợp thông báo real-time
- [ ] Quản lý phân quyền nâng cao
- [ ] Tích hợp upload file luận văn

## Đường dẫn các trang chính

- `/thesis/login` – Đăng nhập
- `/thesis/dashboard` – Trang tổng quan
- `/thesis/datamanagement` – Quản lý dữ liệu đề tài
- `/thesis/assignment` – Phân công đề tài cho GV
- `/thesis/midterm` – Chấm điểm giữa kỳ
- `/thesis/review` – Chấm điểm phản biện
- `/thesis/council` – Quản lý hội đồng
- `/users` – Quản lý Users (test)

## Ghi chú

- FE sử dụng React, Vite, TailwindCSS, lottie-react, ...
- FE chỉ hoạt động khi backend đã chạy và cấu hình đúng API_URL.

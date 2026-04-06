# Kịch bản Demo Dự án Quản lý Luận văn Tốt nghiệp

## 1. Giới thiệu tổng quan

- Giới thiệu tên dự án, mục tiêu (giải quyết bài toán quản lý luận văn tốt nghiệp, hỗ trợ nhà trường, giáo viên, sinh viên quản lý, theo dõi, đánh giá luận văn hiệu quả).
- Giới thiệu các thành viên, vai trò từng người.
- Trình bày sơ đồ kiến trúc tổng thể: Backend (Laravel API), Frontend (React), Database (MySQL), Docker, CI/CD (nếu có).
- Đối tượng sử dụng: Quản trị viên, giáo viên.

---

## 2. Demo theo vai trò

### A. Backend

**1. Trần Quốc Khánh (Team Leader + Backend)**
	- Trình bày sơ đồ database, giải thích các bảng chính (User, Student, Teacher, Topic, Council, Score...)
	- Demo quy trình xác thực (login, phân quyền):
		- Sử dụng tài khoản mẫu (admin/giáo viên/sinh viên) đăng nhập trên Postman, kiểm tra token trả về.
		- Trình bày sự khác biệt về quyền truy cập từng vai trò.
	- Thao tác CRUD trên module Đề tài/Sinh viên:
		- Tạo mới đề tài: gửi request POST với dữ liệu mẫu, kiểm tra phản hồi và dữ liệu trên database.
		- Sửa/xóa đề tài: gửi request PUT/DELETE, kiểm tra kết quả trên hệ thống.
		- Xem danh sách, chi tiết đề tài/sinh viên: gửi request GET, kiểm tra dữ liệu trả về.
	- Trình diễn API bằng Postman hoặc Swagger:
		- Kiểm thử các trường hợp thành công/thất bại (thiếu trường, sai định dạng, không đủ quyền...)
		- Kiểm tra response code, thông báo lỗi.

**2. Lê Tiến Phát (Backend Developer)**
	- Trình bày quá trình kiểm thử, sửa lỗi các API:
		- Minh họa log lỗi thực tế, cách phát hiện và fix bug.
	- Demo chức năng import/export file:
		- Import danh sách sinh viên từ file Excel mẫu (định dạng, cột bắt buộc), kiểm tra dữ liệu sau khi import.
		- Export báo cáo điểm ra file Excel/PDF, kiểm tra file xuất ra đúng dữ liệu.
	- Trình bày cách hoàn thiện các module, kiểm tra log hệ thống.

---

### B. Frontend

**3. Nguyễn Tuấn Anh (Frontend Developer)**
	- Trình bày cấu trúc giao diện, routing các trang chính (đăng nhập, dashboard, quản lý đề tài, sinh viên...)
	- Demo kết nối API:
		- Đăng nhập bằng tài khoản mẫu, kiểm tra chuyển hướng đúng vai trò.
		- Chuyển trang, điều hướng luồng người dùng (đăng nhập, chuyển sang trang quản lý đề tài, xem chi tiết đề tài).
		- Hiển thị thông báo lỗi khi nhập sai thông tin.

**4. Võ Thiên Phú (Frontend Developer)**
	- Trình bày tối ưu responsive, UI/UX:
		- Demo giao diện trên nhiều thiết bị (PC, mobile, tablet) bằng công cụ giả lập trình duyệt.
	- Thao tác nhập/xuất file trên giao diện:
		- Upload file Excel mẫu, kiểm tra dữ liệu hiển thị sau khi upload.
		- Tải báo cáo, kiểm tra file tải về đúng dữ liệu.

**5. Hồ Khôi Phục (Frontend Developer)**
	- Trình bày kiểm tra các chức năng search, filter, pagination:
		- Demo tìm kiếm đề tài/sinh viên theo từ khóa, lọc theo trạng thái, phân trang danh sách.
		- Kiểm tra các trạng thái giao diện: loading, không có dữ liệu, lỗi.
	- Test các luồng thao tác, fix bug giao diện:
		- Minh họa một số lỗi giao diện đã gặp và cách xử lý.

---

### C. DevOps & Tester

**6. Siêu Ngọc Tài (DevOps + Tester)**
	- Trình bày cấu hình Docker, file .env, môi trường phát triển và production:
		- Giới thiệu file .env.example, các biến môi trường quan trọng.
		- Trình bày cấu hình Dockerfile, docker-compose.yml (nếu có).
	- Demo khởi động hệ thống bằng Docker Compose:
		- Chạy lệnh docker compose up, kiểm tra các service hoạt động.
		- Kiểm thử API và UI sau khi khởi động bằng Docker.
	- Trình bày file README, hướng dẫn cài đặt, deploy:
		- Minh họa quy trình cài đặt local, deploy lên môi trường thật.

---

## 3. Demo quy trình nghiệp vụ thực tế (chi tiết từng bước)

1. **Đăng nhập**

   - Sử dụng tài khoản mẫu cho từng vai trò (admin, giáo viên).
   - Minh họa sự khác biệt về giao diện, quyền truy cập của từng vai trò.
   - Kiểm tra các trường hợp nhập sai thông tin, tài khoản bị khóa.
2. **Quản lý đề tài**

   - Tạo mới đề tài: nhập thông tin, chọn giáo viên hướng dẫn, lưu và kiểm tra hiển thị.
   - Phân công giáo viên: chọn đề tài, gán giáo viên, kiểm tra cập nhật thành công.
   - Xét duyệt đề tài: chuyển trạng thái, kiểm tra lịch sử duyệt.
3. **Quản lý sinh viên**

   - Thêm mới sinh viên: nhập thông tin, kiểm tra hiển thị trên danh sách.
   - Cập nhật thông tin sinh viên: sửa, xóa, kiểm tra dữ liệu.
   - Import danh sách sinh viên: upload file Excel, kiểm tra dữ liệu sau khi import.
4. **Quản lý hội đồng**

   - Tạo hội đồng: nhập tên, thêm thành viên, lưu.
   - Phân công thành viên: chọn giáo viên, phân vai trò (chủ tịch, thư ký, ủy viên).
   - Chấm điểm: nhập điểm cho từng sinh viên, kiểm tra tổng hợp điểm.
5. **Xuất báo cáo tổng hợp**

   - Chọn loại báo cáo, xuất file Excel/PDF, kiểm tra dữ liệu trong file.
   - Kiểm tra các trường hợp không có dữ liệu, lỗi xuất file.

---

# Backend - Quản lý luận văn tốt nghiệp

API backend được xây bằng Laravel 12 (PHP 8.3).

**Thực hiện test api (vd bảng users)**

<tên địa chỉ backend>/users

## 1) Chạy local

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

- API base URL local: `http://127.0.0.1:8000/api`
- Health check local: `http://127.0.0.1:8000/up`

## 2) Cấu hình `.env` quan trọng

- `APP_URL`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `SESSION_DRIVER=file`
- `CACHE_STORE=file`

## 3) Deploy Render (Docker)

- Dùng `Dockerfile` trong thư mục `backend`.
- Có thể dùng `render.yaml` ở thư mục gốc.
- Biến môi trường production tối thiểu: `APP_KEY`, `APP_URL`, `DB_*`.

## 4) Chuẩn xác thực

### Đăng nhập

`POST /api/login`

Request body:

```json
{
	"username": "admin",
	"password": "123"
}
```

Response thành công:

```json
{
	"message": "Đăng nhập thành công.",
	"token": "uuid-token",
	"token_type": "Bearer",
	"user": {
		"role": "admin",
		"maGV": "admin",
		"tenGV": "Admin"
	}
}
```

### Gọi API cần đăng nhập

Thêm header:

```http
Authorization: Bearer <token>
```

## 5) Chuẩn phản hồi

- Thành công thường có dạng:
  - `{ "data": ... }`
  - hoặc `{ "message": "..." }`
  - hoặc cả `message` + `data`
- Lỗi xác thực/validate:
  - `401`: sai token/sai thông tin đăng nhập
  - `422`: dữ liệu không hợp lệ hoặc sai điều kiện nghiệp vụ
  - body thường có `message`, và với validate sẽ có thêm `errors`

Ví dụ lỗi 422:

```json
{
	"message": "The given data was invalid.",
	"errors": {
		"mssv": ["The mssv field is required."]
	}
}
```

## 6) Danh sách API theo chức năng

> Trừ `GET /api` và `POST /api/login`, các API còn lại yêu cầu Bearer token.

### 6.1 Hệ thống / tài khoản

- `GET /api` - Kiểm tra API đang chạy
- `POST /api/login` - Đăng nhập lấy token
- `GET /api/me` - Lấy thông tin người dùng hiện tại
- `POST /api/logout` - Đăng xuất (xóa token)
- `POST /api/change-password` - Đổi mật khẩu
- `GET /api/dashboard` - Lấy cấu hình hệ thống + thống kê nhanh
- `PUT /api/settings/stage` - Cập nhật giai đoạn (`next_stage` hoặc `reset_stage`)
- `POST /api/settings/toggle-midterm` - Mở/đóng chấm giữa kỳ

### 6.2 Sinh viên

- `GET /api/students?q=...` - Danh sách sinh viên (có tìm kiếm)
- `GET /api/students/{student}` - Chi tiết sinh viên
- `POST /api/students` - Tạo sinh viên
- `PUT /api/students/{student}` - Cập nhật sinh viên
- `DELETE /api/students/{student}` - Xóa 1 sinh viên
- `DELETE /api/students` - Xóa toàn bộ sinh viên
- `POST /api/students/import-excel` - Import sinh viên từ Excel

Request mẫu tạo sinh viên:

```json
{
	"mssv": "DH52200001",
	"hoTen": "Nguyen Van A",
	"lop": "D22_TH01",
	"email": "a@example.com",
	"soDienThoai": "0900000000"
}
```

### 6.3 Giảng viên

- `GET /api/lecturers` - Danh sách giảng viên
- `GET /api/lecturers/{lecturer}` - Chi tiết giảng viên
- `POST /api/lecturers` - Tạo giảng viên
- `PUT /api/lecturers/{lecturer}` - Cập nhật giảng viên
- `DELETE /api/lecturers/{lecturer}` - Xóa giảng viên

### 6.4 Hội đồng

- `GET /api/councils` - Danh sách hội đồng + thành viên
- `GET /api/councils/{council}` - Chi tiết hội đồng
- `POST /api/councils` - Tạo hội đồng
- `PUT /api/councils/{council}` - Cập nhật hội đồng
- `DELETE /api/councils/{council}` - Xóa hội đồng

Lưu ý nghiệp vụ: 1 giảng viên không được giữ nhiều vai trò trong cùng 1 hội đồng (sẽ trả `422`).

### 6.5 Đề tài và chấm điểm

- `GET /api/topics` - Danh sách đề tài
- `GET /api/topics?type=PB` - Danh sách đề tài đã có phản biện
- `GET /api/topics/{topic}` - Chi tiết đề tài
- `POST /api/topics` - Tạo đề tài
- `PUT /api/topics/{topic}` - Cập nhật đề tài
- `DELETE /api/topics/{topic}` - Xóa đề tài
- `DELETE /api/topics` - Xóa toàn bộ đề tài + gỡ liên kết sinh viên
- `POST /api/topics/create-group-assign` - Tạo nhóm + gán GVHD
- `POST /api/topics/{topic}/assign-gv` - Gán giảng viên hướng dẫn/phản biện (`role_assign: HD|PB`)
- `POST /api/topics/{topic}/assign-reviewer` - Gán giảng viên phản biện
- `PUT /api/topics/{topic}/midterm` - Chấm/cập nhật giữa kỳ
- `POST /api/topics/assign-hoidong` - Gán nhiều đề tài vào hội đồng
- `POST /api/topics/{topic}/score-gvhd` - Chấm điểm GVHD
- `POST /api/topics/{topic}/score-gvpb` - Chấm điểm GVPB
- `POST /api/topics/council-score` - Chấm điểm hội đồng hàng loạt và tính tổng kết

Request mẫu chấm hội đồng:

```json
{
	"scores": [
		{
			"maDeTai": 1,
			"diemHoiDong": 8.5,
			"nhanXetHoiDong": "Trình bày tốt"
		}
	]
}
```

Khi chấm hội đồng, hệ thống tự tính:

- `diemTongKet = diemHuongDan*0.2 + diemPhanBien*0.2 + diemHoiDong*0.6`
- tự sinh `diemChu` theo thang điểm chữ.

### 6.6 Điểm (`scores`)

- `GET /api/scores?maDeTai=...` - Danh sách điểm
- `POST /api/scores` - Tạo bản ghi điểm
- `PUT /api/scores/{score}` - Cập nhật điểm
- `DELETE /api/scores/{score}` - Xóa điểm

Request mẫu tạo điểm:

```json
{
	"maDeTai": 1,
	"maGV": "GV001",
	"loaiDiem": "HuongDan",
	"diemSo": 8.0,
	"nhanXet": "Đạt yêu cầu"
}
```

### 6.7 Export / tiện ích

- `GET /api/exports/midterm` - Xuất báo cáo giữa kỳ
- `GET /api/exports/hoidong` - Xuất báo cáo hội đồng
- `GET /api/exports/phanbien` - Xuất báo cáo phản biện
- `GET /api/exports/tongket` - Xuất báo cáo tổng kết
- `POST /api/exports/word/assignment` - Xuất Word phân công
- `POST /api/exports/word/gvhd/{topic}` - Xuất Word phiếu GVHD
- `POST /api/exports/word/gvpb/{topic}` - Xuất Word phiếu GVPB
- `GET /api/options` - Dữ liệu chọn nhanh (giảng viên/sinh viên/hội đồng)

## 7) Gợi ý luồng sử dụng nhanh

1. `POST /api/login` lấy token.
2. `GET /api/options` lấy dữ liệu dropdown.
3. Quản lý danh mục: `students`, `lecturers`, `councils`.
4. Tạo và gán đề tài: `topics/*assign*`.
5. Chấm điểm: `midterm` -> `score-gvhd/gvpb` -> `council-score`.
6. Xuất báo cáo qua nhóm `exports/*`.

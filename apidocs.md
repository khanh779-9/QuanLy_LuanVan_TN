
# Tài liệu API - Quản lý Luận văn Tốt nghiệp

Tài liệu này mô tả các API chính của hệ thống quản lý luận văn tốt nghiệp. Dùng để test với Postman hoặc tích hợp FE. Tất cả API đều trả về JSON. Các API (trừ login) đều yêu cầu Bearer token.

---

## 1. Đăng nhập +API

### Đăng nhập giảng viên
**POST** `/api/login`

**Body request:**
```json
{
  "maGV": "MA2431",
  "matKhau": "123"
}
```
**Body response:**
```json
{
  "message": "Đăng nhập thành công.",
  "token": "uuid-token",
  "token_type": "Bearer",
  "user": {
    "maGV": "MA2431",
    "tenGV": "Trần Văn Hùng",
    "role": "lecturer"
  }
}
```

### Đăng nhập sinh viên
**POST** `/api/login-sv`
```json
{
  "mssv": "DH52200001",
  "matKhau": "123"
}
```

---
## 2. Sinh viên +API

### Lấy danh sách sinh viên
**GET** `/api/students?q=...`

### Tạo sinh viên
**POST** `/api/students`
```json
{
  "mssv": "DH52200001",
  "hoTen": "Nguyen Van A",
  "lop": "D22_TH01",
  "email": "a@example.com",
  "soDienThoai": "0900000000",
  "maDeTai": null
}
```

### Sửa sinh viên
**PUT** `/api/students/{mssv}`
```json
{
  "hoTen": "Nguyen Van B",
  "lop": "D22_TH01",
  "email": "b@example.com",
  "soDienThoai": "0900000001",
  "maDeTai": 2
}
```

### Xóa sinh viên
**DELETE** `/api/students/{mssv}`

### Import sinh viên từ Excel
**POST** `/api/students/import`
Form-data: file, ky_lvtn_id

---
## 3. Giảng viên +API

### Lấy danh sách giảng viên
**GET** `/api/giang-vien`

### Tạo giảng viên
**POST** `/api/giang-vien`
```json
{
  "maGV": "GV001",
  "tenGV": "Nguyen Van C",
  "email": "gv@example.com"
}
```

### Sửa giảng viên
**PUT** `/api/giang-vien/{maGV}`
```json
{
  "tenGV": "Nguyen Van D",
  "email": "gv2@example.com"
}
```

### Xóa giảng viên
**DELETE** `/api/giang-vien/{maGV}`

---
## 4. Đề tài +API

### Lấy danh sách đề tài
**GET** `/api/de-tai`

### Tạo đề tài
**POST** `/api/de-tai`
```json
{
  "tenDeTai": "Xây dựng hệ thống quản lý luận văn",
  "moTa": "Mô tả đề tài",
  "maGV_HD": "GV001",
  "maGV_PB": "GV002"
}
```

### Sửa đề tài
**PUT** `/api/de-tai/{id}`
```json
{
  "tenDeTai": "Tên mới",
  "moTa": "Mô tả mới"
}
```

### Xóa đề tài
**DELETE** `/api/de-tai/{id}`

### Chấm điểm hướng dẫn
**PUT** `/api/de-tai/{id}/cham-diem-hd`
```json
{
  "diem": 8.5,
  "nhanXet": "Đạt yêu cầu"
}
```

### Chấm điểm phản biện
**PUT** `/api/de-tai/{id}/cham-diem-pb`
```json
{
  "diem": 8.0,
  "nhanXet": "Cần bổ sung"
}
```

---
## 5. Phân công đề tài +API

### Lấy danh sách phân công
**GET** `/api/phan-cong`

### Cập nhật phân công GVHD/GVPB
**PUT** `/api/phan-cong/{id}`
```json
{
  "maGV_HD": "GV001",
  "maGV_PB": "GV002"
}
```

### Xóa phân công đề tài
**DELETE** `/api/phan-cong/{id}`

---
## 6. Giai đoạn +API

### Lấy danh sách giai đoạn
**GET** `/api/giai-doan`

### Lấy giai đoạn hiện tại
**GET** `/api/giai-doan/current`

### Cập nhật giai đoạn
**PUT** `/api/giai-doan/{id}`
```json
{
  "mo_ta": "Giai đoạn mới",
  "ngay_bat_dau": "2024-05-01",
  "ngay_ket_thuc": "2024-06-01"
}
```

---
## 7. Thống kê +API

### Thống kê tổng quan (admin)
**GET** `/api/stats`

### Thống kê giảng viên
**GET** `/api/gv-stats`

### Thống kê sinh viên
**GET** `/api/sv-stats`

---
## 8. Tiện ích khác +API

### Lấy cấu hình thời gian tuỳ chỉnh
**GET** `/api/cauhinh/thoi-gian-tuy-chinh`

### Cập nhật thời gian tuỳ chỉnh
**POST** `/api/cauhinh/thoi-gian-tuy-chinh`
```json
{
  "thoiGian": "2024-05-01T00:00:00"
}
```

### Lấy danh sách lớp
**GET** `/api/students/lop-list`

### Lấy đề tài đăng ký của sinh viên hiện tại
**GET** `/api/topic-registration-form/my`

---
## 9. Chuẩn phản hồi và lỗi

- Thành công: `{ "data": ... }` hoặc `{ "message": "..." }` hoặc cả hai
- Lỗi xác thực/validate:
  - `401`: Sai token/thông tin đăng nhập
  - `422`: Dữ liệu không hợp lệ
  - Body lỗi mẫu:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "mssv": ["The mssv field is required."]
  }
}
```

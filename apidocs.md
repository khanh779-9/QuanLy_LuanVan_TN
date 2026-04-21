# Tài liệu API - Quản lý Luận văn Tốt nghiệp

Tài liệu này mô tả các API chính của hệ thống theo quy ước thống nhất:

- `Quy ước: <method> - <api>`
- `Request json (nếu có)`
- `Response json`

Tất cả API (trừ login và một số API public) trả về JSON và yêu cầu Bearer token.

---

## 1) Xác thực

### Quy ước: POST - /api/login
**Request json (nếu có)**
```json
{
  "maGV": "MA2431",
  "password": "123"
}
```

**Response json**
```json
{
  "token": "plain_text_token",
  "user": {
    "id": "MA2431",
    "name": "Trần Văn Hùng",
    "email": "hung@example.com",
    "type": "giangvien",
    "role": "gv"
  }
}
```

### Quy ước: POST - /api/login-sv
**Request json (nếu có)**
```json
{
  "mssv": "DH52200001",
  "password": "123"
}
```

**Response json**
```json
{
  "token": "plain_text_token",
  "user": {
    "id": "DH52200001",
    "name": "Nguyễn Văn A",
    "email": "sv@example.com",
    "class": "D22_TH01",
    "type": "sinhvien",
    "role": "sinhvien"
  }
}
```

### Quy ước: GET - /api/me
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "id": "MA2431",
  "name": "Trần Văn Hùng",
  "email": "hung@example.com",
  "type": "giangvien",
  "role": "gvhd"
}
```

### Quy ước: POST - /api/logout
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "message": "Dang xuat thanh cong"
}
```

---

## 2) Sinh viên

### Quy ước: GET - /api/students
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "data": [
    {
      "mssv": "DH52200001",
      "hoTen": "Nguyễn Văn A",
      "lop": "D22_TH01",
      "email": "a@example.com",
      "soDienThoai": "0900000000",
      "maDeTai": 1
    }
  ]
}
```

### Quy ước: POST - /api/students
**Request json (nếu có)**
```json
{
  "mssv": "DH52200001",
  "hoTen": "Nguyễn Văn A",
  "lop": "D22_TH01",
  "email": "a@example.com",
  "soDienThoai": "0900000000",
  "maDeTai": null
}
```

**Response json**
```json
{
  "mssv": "DH52200001",
  "hoTen": "Nguyễn Văn A",
  "lop": "D22_TH01",
  "email": "a@example.com",
  "soDienThoai": "0900000000",
  "maDeTai": null
}
```

### Quy ước: PUT - /api/students/{mssv}
**Request json (nếu có)**
```json
{
  "hoTen": "Nguyễn Văn B",
  "lop": "D22_TH01",
  "email": "b@example.com",
  "soDienThoai": "0900000001",
  "maDeTai": 2
}
```

**Response json**
```json
{
  "mssv": "DH52200001",
  "hoTen": "Nguyễn Văn B",
  "lop": "D22_TH01",
  "email": "b@example.com",
  "soDienThoai": "0900000001",
  "maDeTai": 2
}
```

### Quy ước: DELETE - /api/students/{mssv}
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "message": "Deleted"
}
```

### Quy ước: POST - /api/students/import
**Request json (nếu có)**
```json
{
  "note": "API này nhận multipart/form-data: file, ky_lvtn_id"
}
```

**Response json**
```json
{
  "message": "Import thành công",
  "total": 120
}
```

### Quy ước: GET - /api/students/lop-list
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "data": ["D22_TH01", "D22_TH02"]
}
```

---

## 3) Giảng viên

### Quy ước: GET - /api/giang-vien
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "data": [
    {
      "maGV": "GV001",
      "tenGV": "Nguyễn Văn C",
      "email": "gv@example.com"
    }
  ]
}
```

### Quy ước: POST - /api/giang-vien
**Request json (nếu có)**
```json
{
  "maGV": "GV001",
  "tenGV": "Nguyễn Văn C",
  "email": "gv@example.com",
  "matKhau": "123"
}
```

**Response json**
```json
{
  "maGV": "GV001",
  "tenGV": "Nguyễn Văn C",
  "email": "gv@example.com"
}
```

### Quy ước: PUT - /api/giang-vien/{maGV}
**Request json (nếu có)**
```json
{
  "tenGV": "Nguyễn Văn D",
  "email": "gv2@example.com"
}
```

**Response json**
```json
{
  "maGV": "GV001",
  "tenGV": "Nguyễn Văn D",
  "email": "gv2@example.com"
}
```

### Quy ước: DELETE - /api/giang-vien/{maGV}
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "message": "Deleted"
}
```

---

## 4) Nhập liệu đăng ký đề tài

### Quy ước: GET - /api/nhap-lieu
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "data": [
    {
      "id": 1,
      "topic_title": "Hệ thống quản lý luận văn",
      "student1_id": "DH52200001",
      "status": "cho_duyet"
    }
  ]
}
```

### Quy ước: POST - /api/nhap-lieu
**Request json (nếu có)**
```json
{
  "topic_title": "Hệ thống quản lý luận văn",
  "topic_description": "Mô tả",
  "topic_type": "mot_sinh_vien",
  "student1_id": "DH52200001",
  "student1_name": "Nguyễn Văn A",
  "student1_class": "D22_TH01",
  "gvhd_code": "GV001",
  "gvpb_code": "GV002",
  "status": "cho_duyet"
}
```

**Response json**
```json
{
  "data": {
    "id": 1,
    "topic_title": "Hệ thống quản lý luận văn",
    "status": "cho_duyet"
  }
}
```

### Quy ước: PUT - /api/nhap-lieu/{id}
**Request json (nếu có)**
```json
{
  "topic_title": "Tên đề tài cập nhật",
  "status": "cho_duyet"
}
```

**Response json**
```json
{
  "data": {
    "id": 1,
    "topic_title": "Tên đề tài cập nhật",
    "status": "cho_duyet"
  }
}
```

### Quy ước: DELETE - /api/nhap-lieu/{id}
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "message": "Da xoa"
}
```

### Quy ước: POST - /api/topic-registration-form/{id}/approve
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "message": "Đã duyệt và tạo đề tài thành công!",
  "de_tai": {
    "maDeTai": 10,
    "tenDeTai": "Hệ thống quản lý luận văn"
  }
}
```

### Quy ước: POST - /api/nhap-lieu-import-excel
**Request json (nếu có)**
```json
{
  "note": "API này nhận multipart/form-data: file"
}
```

**Response json**
```json
{
  "success": true,
  "imported": 25,
  "errors": []
}
```

### Quy ước: GET - /api/topic-registration-form/my
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "data": {
    "id": 1,
    "topic_title": "Hệ thống quản lý luận văn",
    "status": "cho_duyet"
  }
}
```

---

## 5) Đề tài

### Quy ước: GET - /api/de-tai
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "current_page": 1,
  "data": [
    {
      "maDeTai": 1,
      "tenDeTai": "Xây dựng hệ thống quản lý luận văn",
      "maGV_HD": "GV001",
      "maGV_PB": "GV002"
    }
  ]
}
```

### Quy ước: GET - /api/de-tai/{id}
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "maDeTai": 1,
  "tenDeTai": "Xây dựng hệ thống quản lý luận văn",
  "moTa": "Mô tả đề tài"
}
```

### Quy ước: POST - /api/de-tai
**Request json (nếu có)**
```json
{
  "tenDeTai": "Xây dựng hệ thống quản lý luận văn",
  "moTa": "Mô tả đề tài",
  "maGV_HD": "GV001",
  "maGV_PB": "GV002",
  "maHoiDong": null,
  "trangThai": "dat",
  "data_json": {}
}
```

**Response json**
```json
{
  "maDeTai": 1,
  "tenDeTai": "Xây dựng hệ thống quản lý luận văn"
}
```

### Quy ước: PUT - /api/de-tai/{id}
**Request json (nếu có)**
```json
{
  "tenDeTai": "Tên mới",
  "moTa": "Mô tả mới",
  "data_json": {}
}
```

**Response json**
```json
{
  "maDeTai": 1,
  "tenDeTai": "Tên mới",
  "moTa": "Mô tả mới"
}
```

### Quy ước: DELETE - /api/de-tai/{id}
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "message": "Deleted"
}
```

### Quy ước: PUT - /api/de-tai/{id}/cham-diem-hd
**Request json (nếu có)**
```json
{
  "diemHuongDan": 8.5,
  "nhanXetHuongDan": "Đạt yêu cầu",
  "data_json": {}
}
```

**Response json**
```json
{
  "maDeTai": 1,
  "diemHuongDan": 8.5,
  "nhanXetHuongDan": "Đạt yêu cầu"
}
```

### Quy ước: PUT - /api/de-tai/{id}/cham-diem-pb
**Request json (nếu có)**
```json
{
  "diemHuongDan": 8.0,
  "nhanXetHuongDan": "Cần bổ sung",
  "data_json": {}
}
```

**Response json**
```json
{
  "maDeTai": 1,
  "diemHuongDan": 8.0,
  "nhanXetHuongDan": "Cần bổ sung"
}
```

### Quy ước: PUT - /api/de-tai/{id}/cham-diem-gk
**Request json (nếu có)**
```json
{
  "tieu_chi": [8, 8, 9],
  "tong_diem": 8.3,
  "nhan_xet": "Đạt",
  "trang_thai": "dat"
}
```

**Response json**
```json
{
  "maDeTai": 1,
  "diemGiuaKy": 8.3,
  "nhanXetGiuaKy": "Đạt",
  "trangThaiGiuaKy": "dat"
}
```

### Quy ước: GET - /api/de-tai/{id}/export/gvhd
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "note": "Response là file .docx để tải về"
}
```

### Quy ước: GET - /api/de-tai/{id}/export/gvpb
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "note": "Response là file .docx để tải về"
}
```

---

## 6) Phân công đề tài

### Quy ước: GET - /api/phan-cong
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "data": [
    {
      "id": 1,
      "maDeTai": 1,
      "maGV_HD": "GV001",
      "maGV_PB": "GV002"
    }
  ]
}
```

### Quy ước: PUT - /api/phan-cong/{id}
**Request json (nếu có)**
```json
{
  "maGV_HD": "GV001",
  "maGV_PB": "GV002"
}
```

**Response json**
```json
{
  "id": 1,
  "maGV_HD": "GV001",
  "maGV_PB": "GV002"
}
```

### Quy ước: DELETE - /api/phan-cong/{id}
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "message": "Deleted"
}
```

---

## 7) Giai đoạn

### Quy ước: GET - /api/giai-doan
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
[
  {
    "id": 1,
    "mo_ta": "Đăng ký đề tài",
    "ngay_bat_dau": "2026-04-01",
    "ngay_ket_thuc": "2026-04-30"
  }
]
```

### Quy ước: GET - /api/giai-doan/current
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "id": 1,
  "mo_ta": "Đăng ký đề tài",
  "ngay_bat_dau": "2026-04-01",
  "ngay_ket_thuc": "2026-04-30"
}
```

### Quy ước: PUT - /api/giai-doan/{id}
**Request json (nếu có)**
```json
{
  "mo_ta": "Giai đoạn mới",
  "ngay_bat_dau": "2026-05-01",
  "ngay_ket_thuc": "2026-06-01"
}
```

**Response json**
```json
{
  "id": 1,
  "mo_ta": "Giai đoạn mới",
  "ngay_bat_dau": "2026-05-01",
  "ngay_ket_thuc": "2026-06-01"
}
```

---

## 8) Thống kê

### Quy ước: GET - /api/stats
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "tong_sinh_vien": 120,
  "tong_giang_vien": 25,
  "tong_de_tai": 80
}
```

### Quy ước: GET - /api/gv-stats
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "tong_de_tai_huong_dan": 8,
  "tong_de_tai_phan_bien": 6
}
```

### Quy ước: GET - /api/sv-stats
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "de_tai_da_dang_ky": 1,
  "trang_thai": "cho_duyet"
}
```

---

## 9) Cấu hình thời gian tuỳ chỉnh

### Quy ước: GET - /api/cauhinh/thoi-gian-tuy-chinh
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "thoiGian": "2026-05-01T00:00:00"
}
```

### Quy ước: POST - /api/cauhinh/thoi-gian-tuy-chinh
**Request json (nếu có)**
```json
{
  "thoiGian": "2026-05-01T00:00:00"
}
```

**Response json**
```json
{
  "message": "Cập nhật thành công",
  "thoiGian": "2026-05-01T00:00:00"
}
```

---

## 10) Chuẩn phản hồi lỗi

### Quy ước: ERROR - 401 Unauthorized
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "message": "Unauthenticated."
}
```

### Quy ước: ERROR - 422 Validation Error
**Request json (nếu có)**
```json
{}
```

**Response json**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "mssv": ["The mssv field is required."]
  }
}
```

# Yêu cầu từ thầy — Project 1

> Nguồn: `docs/thesis/Projects.docx`
> Ghi lại nguyên văn yêu cầu của thầy Trần Văn Hùng, chỉ format lại cho dễ đọc.

---

## Đề tài

**Xây dựng ứng dụng quản lý sinh viên LVTN của khoa CNTT**

---

## Đối tượng sử dụng

SV / Giảng viên (Hướng dẫn / Phản biện) / Thư ký khoa (Admin)

---

## Mô tả tổng quan

Tới kỳ làm LVTN thư ký khoa sẽ có danh sách SV được làm, và phân công danh sách này cho GV để hướng dẫn. Mỗi GV tối đa 10 SV.

---

## Chức năng theo vai trò

### Thư ký khoa (Admin)

- Nhận DSSV được làm LVTN từ Phòng Đào tạo (file Excel)
- Thiết lập các thời gian làm LVTN (như các mục bên dưới)
- Phân công SV cho GVHD
- Nhận kết quả nhận đề tài
- In công bố kết quả 50% LVTN (Không cần)
- Phân công các đề tài cho GV Phản biện (là danh sách GV)
- Lập Hội đồng bảo vệ LVTN:
  - Ngày bảo vệ
  - Phòng
  - Số hội đồng
  - Danh sách trong hội đồng (3-4 GV: 1 chủ tịch, 1 thư ký và các thành viên)
- Phân công các đề tài vào hội đồng (có thứ tự)
- Xuất danh sách bảo vệ LVTN

### Giảng viên

**GVHD (Giáo viên hướng dẫn):**

- Nhận danh sách SV hướng dẫn
- Giao đề tài LVTN — đề tài có thể chọn làm theo nhóm 2 hay 1 sinh viên
- Đánh giá 50%
- Chấm điểm hướng dẫn -> xuất file Word để in
  - Mẫu 01.01: Phiếu chấm hướng dẫn — nhóm sinh viên
  - Mẫu 01.02: Phiếu chấm hướng dẫn — sinh viên (cá nhân)

**GVPB (Giáo viên phản biện):**

- Nhận danh sách phản biện
- Chấm điểm -> xuất file Word
  - Mẫu 02.01: Phiếu chấm phản biện — nhóm sinh viên
  - Mẫu 02.02: Phiếu chấm phản biện — sinh viên (cá nhân)

### Sinh viên

- In ra tờ nhiệm vụ để đóng vào cuốn báo cáo (có 2 template cho 1 hay 2 SV)
  - Form_NhiemvuLVTN.doc

---

## Kiến trúc & Tech Stack

Xây dựng web - MVC:

- **Phương án 1**: Laravel — backend + frontend
- **Phương án 2**: Backend Laravel — Frontend React, Angular,...

---

## Công việc cần làm

- Dựng Laravel
- Tìm cài đặt các package cần thiết:
  - Import/export Excel: import sinh viên, export sinh viên
  - Export data ra template .docx: điểm GVHD, phản biện, hội đồng
- Hỗ trợ hosting Laravel — nhóm đăng ký domain

---

## Chuẩn bị môi trường

- Wamp hoặc Xampp (chọn 1)
- Composer (tool quản lý PHP)
- Cài đặt Laravel (v12)
- Mua domain (.io.vn, .id.vn)

---

## File mẫu (template Word) từ thầy

| File                                             | Link gốc                                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Form_NhiemvuLVTN.doc                             | https://tranvanhung.fitstu.net/lvtn/Form_NhiemvuLVTN.doc                                        |
| Mẫu 01.01 — Phiếu chấm HD nhóm SV           | https://tranvanhung.fitstu.net/lvtn/Mau%2001.01_PHIEU%20CHAM_HUONG%20DAN_NHOM%20SINH%20VIEN.doc |
| Mẫu 01.02 — Phiếu chấm HD cá nhân          | https://tranvanhung.fitstu.net/lvtn/Mau%2001.02_PHIEU%20CHAM_HUONG%20DAN_SINH%20VIEN.doc        |
| Mẫu 02.01 — Phiếu chấm PB nhóm SV           | https://tranvanhung.fitstu.net/lvtn/Mau%2002.01_PHIEU%20CHAM_PHAN%20BIEN_NHOM%20SINH%20VIEN.doc |
| Mẫu 02.02 — Phiếu chấm PB cá nhân          | https://tranvanhung.fitstu.net/lvtn/Mau%2002.02_PHIEU%20CHAM_PHAN%20BIEN_SINH%20VIEN.doc        |
| Chốt_DSSV_GVHD_TenDeTai_LVTN_Dot2_17112025.xlsx | Import file, ưu tiên tab đầu tiên ()                                                       |

> Tất cả file mẫu đã được copy vào `docs/thesis/`

---

## Những điểm cần làm rõ với thầy

1. **"Đánh giá 50%"** — cụ thể là đánh giá gì? Giữa kỳ? Tiến độ?
   Trả lời: Đánh giá 50% LVTN, tương đương là chấm giữa kì
2. **Công thức tính điểm tổng kết** — report tham khảo ghi 20% HD + 20% PB + 60% HĐ, thầy xác nhận?
   Trả lời: đúng
3. **SV có tự đăng ký đề tài không?** — hay chỉ GVHD giao? (Projects.docx ghi GVHD giao)
   Trả lời: SV tự đăng kí đề tài qua link pdt, pdt lọc sv rồi đưa cho khoa, khoa (thư kí) là người import file vào
4. **Các mốc thời gian cụ thể** — bao nhiêu tuần, deadline từng giai đoạn?
5. **Frontend** — dùng Blade (PA1) hay tách React/Angular (PA2)?
   Trả lời: Dùng react

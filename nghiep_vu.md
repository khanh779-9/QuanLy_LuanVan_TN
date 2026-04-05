# Kế hoạch dự án — Hệ thống Quản lý LVTN

> Tài liệu này dùng để họp nhóm trước khi bắt đầu code.
> Đọc kỹ phần phân công và quy tắc làm việc trước khi nhận task.

---

## 1. Dự án là gì?

Web app quản lý toàn bộ quy trình Luận văn Tốt nghiệp của Khoa CNTT — ĐH Công Nghệ Sài Gòn.

Thay thế việc thư ký khoa đang làm thủ công qua Excel + email bằng một hệ thống có giao diện web, phân quyền từng vai trò.

**4 loại người dùng:**

| Vai trò | Tên hiển thị | Họ làm gì trên hệ thống |
|---------|-------------|--------------------------|
| Admin | Thư ký khoa | Import SV, phân công, lập hội đồng, xuất danh sách |
| GVHD | Giảng viên hướng dẫn | Giao đề tài, chấm điểm HD, xuất phiếu chấm Word |
| GVPB | Giảng viên phản biện | Chấm điểm PB, xuất phiếu chấm Word |
| SV | Sinh viên | Xem đề tài, tải tờ nhiệm vụ LVTN |

> **Lưu ý:** 1 giảng viên có thể đồng thời là GVHD của nhóm A, GVPB của nhóm B, và thành viên hội đồng của nhóm C. Hệ thống phải xử lý được điều này.

---

## 2. Tech Stack

| Phần | Công nghệ | Deploy |
|------|-----------|--------|
| Backend | Laravel 12 (REST API) | Railway |
| Frontend | React + Vite + Tailwind | Vercel |
| Database | MySQL | Aiven (cloud MySQL) |
| Auth | Laravel Sanctum (Bearer token) | — |
| Import Excel | phpoffice/phpspreadsheet | — |
| Export Word | phpoffice/phpword | — |

**Kết nối:** FE gọi BE qua REST API, xác thực bằng Bearer token lưu trong localStorage.

**Rate limit:** 60 request / phút / IP (giới hạn ở BE).

**CORS:** BE chỉ cho phép request từ domain Vercel của FE.

---

## 3. Phân công team

| Người | Role | Phụ trách |
|-------|------|-----------|
| **BE-1** | Backend | Laravel setup, Auth, Database schema, Logic nghiệp vụ chính |
| **BE-2** | Backend | Import Excel, Export Word, Hội đồng, Tính điểm |
| **FE-1** | Frontend | React setup, Layout, Auth flow, Trang Admin (quản lý SV/GV/Kỳ LVTN) |
| **FE-2** | Frontend | Trang GVHD, Trang GVPB, Form chấm điểm |
| **FE-3** | Frontend | Trang Hội đồng, Bảng điểm tổng hợp, SV Portal |
| **OPS** | DevOps/QA | Deploy Railway + Vercel, viết tài liệu API, test từng phase |

---

## 4. Quy tắc làm việc (quan trọng)

**Để BE và FE không bị block nhau:**

1. **Mỗi phase có API contract** — danh sách endpoint + request/response format thống nhất trước khi code. OPS viết thành tài liệu.
2. **FE dùng mock data** khi BE chưa xong — không ngồi chờ.
3. **Cuối mỗi phase** — BE + FE integrate và test chung, OPS verify.
4. **Phase 1 làm chung** — cả team hiểu cấu trúc project trước khi tách ra làm độc lập.

**Git:**
- BE repo riêng, FE repo riêng (hoặc monorepo tùy team quyết)
- Commit message dùng prefix: `feat:`, `fix:`, `docs:`, `chore:`
- Không commit file `.env` — chỉ commit `.env.example`

---

## 5. Timeline — 6 Phases (~5-6 tuần)

```
Tuần 1-1.5  → Phase 1: Nền tảng (setup, auth, database)
Tuần 2      → Phase 2: Quản lý SV & GV (import Excel, CRUD)
Tuần 3      → Phase 3: Đề tài & Phân công
Tuần 4-4.5  → Phase 4: Chấm điểm & Export Word  ← phase khó nhất
Tuần 5      → Phase 5: Hội đồng & SV Portal
Tuần 5.5-6  → Phase 6: Tích hợp & Deploy
```

---

## 6. Chi tiết từng Phase

---

### Phase 1 — Nền tảng

**Mục tiêu:** Project chạy được, login thành công, BE và FE kết nối được với nhau.

**BE làm:**
- Tạo Laravel project mới, cài packages, config CORS + Rate limit
- Tạo đầy đủ database migrations (8 bảng)
- Viết Auth API (login, logout, me)
- Tạo seeder: 1 admin, vài GV, vài SV mẫu để test

**FE làm:**
- Tạo React project (Vite + Tailwind + React Router)
- Trang Login
- Layout chung với sidebar menu theo role
- Protected routes (chặn truy cập khi chưa login)

**API contract Phase 1:**
```
POST /api/login      { email, password }
                  →  { token, user: { id, name, roles[] } }

POST /api/logout     Header: Authorization: Bearer {token}
                  →  200 OK

GET  /api/me         Header: Authorization: Bearer {token}
                  →  { id, name, email, roles[] }
```

**Done khi:**
- Login với từng role → thấy menu đúng vai trò
- Token lưu localStorage, F5 không bị logout
- `php artisan migrate` chạy sạch từ DB trống

**Database schema:**

```
giangvien       id, ten, email, password, hoc_vi, is_admin, created_at
sinhvien        id, mssv, ten, lop, email, password, created_at
ky_lvtn         id, ten, ngay_nhan_de_tai, ngay_cham_50, ngay_phan_bien, ngay_bao_ve, created_at
detai           id, ten, mo_ta, muc_tieu, output, gv_hd_id, ky_id, loai(1sv|2sv), created_at
detai_sinhvien  id, detai_id, sinhvien_id
hoidong         id, so_hoi_dong, ngay_bao_ve, phong, ky_id, created_at
thanhvien_hd    id, hoidong_id, gv_id, vai_tro(chu_tich|thu_ky|uy_vien)
diem_hoidong    id, detai_id, gv_id, diem, nhan_xet, created_at
diem_huong_dan  id, detai_id, tieu_chi(JSON), tong_diem, nhan_xet
diem_phan_bien  id, detai_id, tieu_chi(JSON), tong_diem, nhan_xet
```

---

### Phase 2 — Quản lý SV & GV

**Mục tiêu:** Admin import được danh sách SV từ file Excel, quản lý GV và kỳ LVTN.

**BE làm:**
- API import Excel (parse, validate, insert SV + tự tạo tài khoản)
- CRUD API cho SV, GV, kỳ LVTN

**FE làm:**
- Trang upload Excel + hiển thị lỗi từng dòng
- Bảng danh sách SV (filter theo lớp, search)
- Bảng danh sách GV + form thêm/sửa
- Form tạo/sửa kỳ LVTN với các mốc ngày

**API contract Phase 2:**
```
POST   /api/students/import       multipart/form-data: file
                               →  { imported: 45, errors: [{row: 5, msg: "MSSV trùng"}] }

GET    /api/students              ?ky_id=&lop=&search=
                               →  { data: [{id, mssv, ten, lop, email, gvhd}] }

POST   /api/students              { mssv, ten, lop, email }
PUT    /api/students/{id}         (same)
DELETE /api/students/{id}

GET    /api/giang-vien            → { data: [...] }
POST   /api/giang-vien            { ten, email, password, hoc_vi }
PUT    /api/giang-vien/{id}
DELETE /api/giang-vien/{id}

GET    /api/ky-lvtn               → { data: [...] }
POST   /api/ky-lvtn               { ten, ngay_nhan_de_tai, ngay_cham_50, ngay_phan_bien, ngay_bao_ve }
PUT    /api/ky-lvtn/{id}
```

**Done khi:**
- Upload file Excel mẫu → SV xuất hiện trong danh sách, tài khoản tự tạo
- Lỗi dòng 5 trùng MSSV → hiển thị đúng "Dòng 5: MSSV đã tồn tại"
- Admin sửa được mốc thời gian kỳ LVTN

---

### Phase 3 — Đề tài & Phân công

**Mục tiêu:** Admin phân công SV cho GVHD, GVHD giao đề tài, admin phân công GVPB.

**BE làm:**
- API phân công SV cho GVHD (check max 10 SV/GV)
- CRUD đề tài (GVHD tạo + gán 1-2 SV)
- API phân công GVPB cho đề tài
- `GET /api/de-tai` lọc theo role người đang login

**FE làm:**
- Trang phân công GVHD — chọn GV, chọn nhiều SV, hiển thị X/10
- Trang GVHD — danh sách SV + form tạo đề tài
- Trang phân công GVPB — dropdown chọn GVPB cho từng đề tài
- Trang GVPB — danh sách đề tài phản biện

**API contract Phase 3:**
```
POST   /api/phan-cong/gvhd        { gv_id, sv_ids: [1, 2, 3] }
                               →  { ok: true } hoặc { error: "GV đã đủ 10 SV" }

GET    /api/de-tai                → filtered by current user role
POST   /api/de-tai                { ten, mo_ta, muc_tieu, output, sv_ids: [id1] hoặc [id1, id2] }
PUT    /api/de-tai/{id}
PUT    /api/de-tai/{id}/gvpb      { gv_pb_id }
                               →  cảnh báo nếu GVPB trùng GVHD
```

**Done khi:**
- Gán SV thứ 11 cho GV → bị từ chối có thông báo rõ
- GVHD chỉ thấy SV và đề tài của mình
- GVPB đăng nhập thấy đúng danh sách đề tài phản biện

---

### Phase 4 — Chấm điểm & Export Word

**Mục tiêu:** GVHD + GVPB chấm điểm và xuất phiếu chấm ra file Word đúng mẫu.

> ⚠️ **Phase có rủi ro cao nhất** — export Word cần test sớm. File `.doc` gốc cần convert sang `.docx` trước, placeholder phải viết dưới dạng `${ten_sv}` không có space thừa, nếu không phpoffice sẽ không tìm thấy.

**BE làm:**
- API lưu điểm GVHD, điểm giữa kỳ, điểm GVPB
- API export Word: nhận `detai_id` → fill template → stream file về client
  - 1 SV → dùng Mẫu 01.02 / 02.02
  - 2 SV → dùng Mẫu 01.01 / 02.01

**FE làm:**
- Form chấm điểm GVHD (tiêu chí + tự tính tổng + nhận xét)
- Form đánh giá giữa kỳ (trạng thái + nhận xét)
- Form chấm điểm GVPB (tương tự GVHD)
- Nút Download → gọi API export, nhận blob → tạo link download

**API contract Phase 4:**
```
POST   /api/de-tai/{id}/diem-hd    { tieu_chi: {tc1: 8, tc2: 7, ...}, tong_diem: 7.5, nhan_xet: "..." }
POST   /api/de-tai/{id}/diem-gk    { trang_thai: "dat"|"khong_dat", nhan_xet: "..." }
POST   /api/de-tai/{id}/diem-pb    { tieu_chi: {...}, tong_diem: 8, nhan_xet: "..." }
PUT    /api/de-tai/{id}/diem-hd    (sửa lại)
PUT    /api/de-tai/{id}/diem-pb    (sửa lại)

GET    /api/de-tai/{id}/export/gvhd  → file .docx (Content-Disposition: attachment)
GET    /api/de-tai/{id}/export/gvpb  → file .docx
```

**Done khi:**
- Mở file Word xuất ra, thấy tên SV/đề tài/điểm điền đúng chỗ
- Font tiếng Việt không bị lỗi
- Tự chọn đúng mẫu nhóm vs cá nhân

---

### Phase 5 — Hội đồng & SV Portal

**Mục tiêu:** Admin lập hội đồng, TV HĐ tự nhập điểm, SV xem thông tin và tải form nhiệm vụ.

**BE làm:**
- CRUD hội đồng + thêm GV theo vai trò (chủ tịch, thư ký, uỷ viên)
- API gán đề tài vào hội đồng có thứ tự
- API TV HĐ nhập điểm riêng cho từng đề tài
- Tự động tính điểm tổng kết: `HD×0.2 + PB×0.2 + avg(HĐ)×0.6`
- API xuất danh sách bảo vệ ra Excel
- API xuất Form nhiệm vụ LVTN (Word) cho SV

**FE làm:**
- Trang lập hội đồng — form tạo HĐ, chọn GV theo vai trò
- Trang gán đề tài vào HĐ + sắp thứ tự trình bày
- Trang TV HĐ — danh sách đề tài cần chấm, form nhập điểm
- Bảng điểm tổng hợp — xem HD, PB, HĐ, tổng kết, điểm chữ
- SV Portal — xem đề tài + trạng thái + nút tải form nhiệm vụ

**API contract Phase 5:**
```
GET/POST       /api/hoi-dong                  list / tạo mới
PUT/DELETE     /api/hoi-dong/{id}
POST           /api/hoi-dong/{id}/thanh-vien  { gv_id, vai_tro: "chu_tich"|"thu_ky"|"uy_vien" }
POST           /api/hoi-dong/{id}/de-tai      { de_tai_ids: [5, 3, 1], thu_tu_start: 1 }
GET            /api/hoi-dong/{id}/export      → file Excel

POST           /api/de-tai/{id}/diem-hd-tv    { diem: 8.5, nhan_xet: "..." }  (TV HĐ gọi)
GET            /api/de-tai/{id}/diem-tong-ket → { diem_hd, diem_pb, diem_hoi_dong, tong_ket, diem_chu }

GET            /api/sv/de-tai                 → đề tài + GVHD + trạng thái của SV đang login
GET            /api/sv/form-nhiem-vu          → file .docx
```

**Done khi:**
- 3 TV HĐ nhập điểm xong → điểm tổng kết tính đúng công thức
- SV login → tải được form nhiệm vụ đã điền sẵn thông tin
- Admin export được Excel danh sách bảo vệ

---

### Phase 6 — Tích hợp & Deploy

**Mục tiêu:** Toàn bộ flow chạy end-to-end, demo được trên domain thật.

**OPS làm:**
- Deploy BE lên Railway (config env, migrate, test API)
- Deploy FE lên Vercel (config VITE_API_URL trỏ đúng Railway)
- Test full demo flow từ đầu đến cuối
- Kiểm tra trên máy không phải máy dev

**BE + FE:**
- Fix bugs phát hiện khi test trên production
- Fix CORS nếu có vấn đề

**Demo flow phải chạy được:**
```
1. Admin login
2. Tạo kỳ LVTN (đặt tên + các mốc thời gian)
3. Import file Excel DSSV → SV xuất hiện trong danh sách
4. Phân công SV cho GVHD

5. GVHD login → xem DSSV → tạo đề tài gán 2 SV
6. GVHD chấm điểm HD → tải file Word Mẫu 01.01

7. Admin phân công GVPB cho đề tài

8. GVPB login → xem đề tài → chấm điểm → tải file Word Mẫu 02.01

9. Admin lập hội đồng (3 GV) → gán đề tài vào HĐ
10. Admin xuất danh sách bảo vệ (Excel)

11. TV HĐ (3 người) lần lượt login → nhập điểm
12. Admin xem bảng điểm tổng kết — tính đúng

13. SV login → xem đề tài → tải form nhiệm vụ LVTN
```

---

## 7. Nếu bị trễ — cắt theo thứ tự này

1. Bảng điểm đẹp với filter/chart → bảng HTML đơn giản
2. Drag-drop sắp thứ tự đề tài trong HĐ → input nhập số thứ tự
3. Preview Excel trước khi import → import thẳng, hiện kết quả sau

**Không cắt những cái này:**
- Import SV từ Excel
- Phân công GVHD
- Giao đề tài
- Chấm điểm GVHD + GVPB
- Export Word phiếu chấm
- Lập hội đồng + TV HĐ nhập điểm
- SV tải form nhiệm vụ

---

## 8. Setup môi trường local

**Yêu cầu:**
- PHP 8.2+, Composer
- Node.js 20+, npm
- MySQL client (kết nối Aiven remote)

**File `.env.example`** đã có trong repo root — copy thành `.env` và điền:
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` — lấy từ Aiven console
- `DB_SSL_CA` — download CA cert từ Aiven, để vào `storage/`
- `FRONTEND_URL` — URL Vercel của FE (để config CORS)
- `SANCTUM_STATEFUL_DOMAINS` — domain FE

**BE chạy local:**
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve   # chạy ở localhost:8000
```

**FE chạy local:**
```bash
npm install
# tạo file .env.local
# VITE_API_URL=http://localhost:8000
npm run dev   # chạy ở localhost:5173
```

---

## 9. Yêu cầu báo cáo từ thầy

**Kiểm tra lần 1 (thuyết trình trên lớp):**
- Slide PowerPoint: giới thiệu đề tài, chức năng, database schema (chụp relationship), công nghệ dùng, công việc từng thành viên (kỹ), kết quả đã làm
- Demo chạy live trên máy + trên hosting (cần laptop dự phòng)
- Cung cấp: link website FE, link BE API, link GitHub

**Kiểm tra kết thúc (tuần cuối):**
- Báo cáo in A4 theo mẫu: https://tranvanhung.fitstu.net/lvtn/Y_MAU_LVTN_2025.pdf
  - Trang bìa: tên môn học, danh sách SV, GVHD
  - Trang 2: công việc từng thành viên + % đóng góp (tổng = 100%), link website + GitHub
- Mỗi người chuẩn bị laptop riêng, test được phần mình làm
- 30 phút / nhóm
- **Không bắt buộc làm hết** — ưu tiên làm tốt cái đã làm

---

*Cập nhật lần cuối: 2026-04-03*
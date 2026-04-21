<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SinhVienController;
use App\Http\Controllers\GiangVienController;
use App\Http\Controllers\KyLvtnController;
use App\Http\Controllers\TopicRegistrationFormController;
use App\Models\TopicRegistrationForm;
use Illuminate\Support\Facades\DB;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/login-sv', [AuthController::class, 'loginSinhVien']);


// API lấy thời gian tuỳ chỉnh (public)
Route::get('/cauhinh/thoi-gian-tuy-chinh', [\App\Http\Controllers\CauHinhController::class, 'getThoiGianTuyChinh']);

// API cập nhật thời gian tuỳ chỉnh (chỉ admin)
// Route::middleware(['auth:sanctum', 'role.admin'])->post('/cauhinh/thoi-gian-tuy-chinh', [\App\Http\Controllers\CauHinhController::class, 'setThoiGianTuyChinh']);

Route::post('/cauhinh/thoi-gian-tuy-chinh', [\App\Http\Controllers\CauHinhController::class, 'setThoiGianTuyChinh']);

// API Giai đoạn (Public)   
Route::get('/giai-doan', [\App\Http\Controllers\GiaiDoanController::class, 'index']);
Route::get('/giai-doan/current', [\App\Http\Controllers\GiaiDoanController::class, 'current']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/students/import', [SinhVienController::class, 'import']);
    Route::get('/students/lop-list', [SinhVienController::class, 'lopList']);
    Route::get('/students', [SinhVienController::class, 'index']);
    Route::post('/students', [SinhVienController::class, 'store']);
    Route::put('/students/{mssv}', [SinhVienController::class, 'update']);
    Route::delete('/students/{mssv}', [SinhVienController::class, 'destroy']);

    Route::get('/giang-vien', [GiangVienController::class, 'index']);
    Route::post('/giang-vien', [GiangVienController::class, 'store']);
    Route::put('/giang-vien/{maGV}', [GiangVienController::class, 'update']);
    Route::delete('/giang-vien/{maGV}', [GiangVienController::class, 'destroy']);

    Route::get('/nhap-lieu', [TopicRegistrationFormController::class, 'index']);
    Route::post('/nhap-lieu', [TopicRegistrationFormController::class, 'store']);
    Route::put('/nhap-lieu/{id}', [TopicRegistrationFormController::class, 'update']);
    Route::delete('/nhap-lieu/{id}', [TopicRegistrationFormController::class, 'destroy']);

    Route::post('/topic-registration-form/{id}/approve', [TopicRegistrationFormController::class, 'approve']);
    Route::post('/nhap-lieu/approve-all-pending', [TopicRegistrationFormController::class, 'approveAllPending']);
    Route::post('/nhap-lieu-import-excel', [TopicRegistrationFormController::class, 'importExcel']);

    // Cập nhật giai đoạn (yêu cầu đăng nhập)
    Route::put('/giai-doan/{id}', [\App\Http\Controllers\GiaiDoanController::class, 'update']);
    Route::post('/giai-doan', [\App\Http\Controllers\GiaiDoanController::class, 'store']);
    Route::delete('/giai-doan/{id}', [\App\Http\Controllers\GiaiDoanController::class, 'destroy']);
    // API Phân công (Cấu trúc mới: Phân trang và Tách rời controller)
    Route::get('/phan-cong', [\App\Http\Controllers\PhanCongController::class, 'index']);
    Route::put('/phan-cong/{id}', [\App\Http\Controllers\PhanCongController::class, 'update']);
    Route::delete('/phan-cong/{id}', [\App\Http\Controllers\PhanCongController::class, 'destroy']);
    Route::get('/phan-cong/danh-sach-chua-co-gvhd', [\App\Http\Controllers\PhanCongController::class, 'getDanhSachChuaCoGVHD']);
    Route::post('/phan-cong/phan-cong-gvhd', [\App\Http\Controllers\PhanCongController::class, 'phancongGVHD']);
    Route::get('/phan-cong/danh-sach-chua-co-gvpb', [\App\Http\Controllers\PhanCongController::class, 'getDanhSachChuaCoGVPB']);
    Route::post('/phan-cong/phan-cong-gvpb', [\App\Http\Controllers\PhanCongController::class, 'phancongGVPB']);
    // API phân công giảng viên vào hội đồng
    Route::post('/hoi-dong/phan-cong-giang-vien', [\App\Http\Controllers\ThanhVienHoiDongController::class, 'phanCongGiangVien']);
    // Thành viên hội đồng
    Route::get('/hoi-dong/{maHoiDong}/thanh-vien', [\App\Http\Controllers\ThanhVienHoiDongController::class, 'index']);
    Route::delete('/hoi-dong/thanh-vien/{id}', [\App\Http\Controllers\ThanhVienHoiDongController::class, 'destroy']);
    Route::put('/hoi-dong/thanh-vien/{id}', [\App\Http\Controllers\ThanhVienHoiDongController::class, 'update']);
    Route::get('/hoi-dong/{maHoiDong}/giang-vien-chua-co', [\App\Http\Controllers\ThanhVienHoiDongController::class, 'getDanhSachGiangVienChuaCoTrongHoiDong']);
    // CRUD Hội đồng (chỉ dùng HoiDongController)
    Route::get('/hoi-dong', [\App\Http\Controllers\HoiDongController::class, 'index']);
    Route::get('/hoi-dong/{id}', [\App\Http\Controllers\HoiDongController::class, 'show']);
    Route::post('/hoi-dong', [\App\Http\Controllers\HoiDongController::class, 'store']);
    Route::put('/hoi-dong/{id}', [\App\Http\Controllers\HoiDongController::class, 'update']);
    Route::delete('/hoi-dong/{id}', [\App\Http\Controllers\HoiDongController::class, 'destroy']);
    // CRUD Đề tài
    Route::get('/de-tai', [\App\Http\Controllers\DeTaiController::class, 'index']);
    Route::get('/de-tai/my', [\App\Http\Controllers\DeTaiController::class, 'my']);
    Route::get('/de-tai/{id}', [\App\Http\Controllers\DeTaiController::class, 'show']);
    Route::post('/de-tai', [\App\Http\Controllers\DeTaiController::class, 'store']);
    Route::put('/de-tai/{id}', [\App\Http\Controllers\DeTaiController::class, 'update']);
    Route::put('/de-tai/{id}/cham-diem-hd', [\App\Http\Controllers\DeTaiController::class, 'chamDiemHD']);
    Route::put('/de-tai/{id}/cham-diem-pb', [\App\Http\Controllers\DeTaiController::class, 'chamDiemPB']);
    Route::put('/de-tai/{id}/cham-diem-gk', [\App\Http\Controllers\DeTaiController::class, 'chamDiemGK']);
    Route::delete('/de-tai/{id}', [\App\Http\Controllers\DeTaiController::class, 'destroy']);
    Route::get('/de-tai/{id}/export/gvhd', [\App\Http\Controllers\DeTaiController::class, 'exportGVHD']);
    Route::get('/de-tai/{id}/export/gvpb', [\App\Http\Controllers\DeTaiController::class, 'exportGVPB']);
    Route::get('/de-tai/{id}/export/nhiem-vu', [\App\Http\Controllers\DeTaiController::class, 'exportNhiemVu']);

    // API thống kê tổng quan (Dashboard)
    Route::get('/stats', [\App\Http\Controllers\StatsController::class, 'adminStats']);
    Route::get('/gv-stats', [\App\Http\Controllers\StatsController::class, 'gvStats']);
    Route::get('/sv-stats', [\App\Http\Controllers\StatsController::class, 'svStats']);

    // API: Lấy đề tài đăng ký của sinh viên hiện tại
    Route::get('/topic-registration-form/my', [\App\Http\Controllers\TopicRegistrationFormController::class, 'my']);
});

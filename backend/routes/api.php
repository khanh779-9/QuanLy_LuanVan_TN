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

    // API Phân công (Cấu trúc mới: Phân trang và Tách rời controller)
    Route::get('/phan-cong', [\App\Http\Controllers\PhanCongController::class, 'index']);
    Route::put('/phan-cong/{id}', [\App\Http\Controllers\PhanCongController::class, 'update']);
    Route::delete('/phan-cong/{id}', [\App\Http\Controllers\PhanCongController::class, 'destroy']);

    // CRUD Đề tài
    Route::get('/de-tai', [\App\Http\Controllers\DeTaiController::class, 'index']);
    Route::get('/de-tai/{id}', [\App\Http\Controllers\DeTaiController::class, 'show']);
    Route::post('/de-tai', [\App\Http\Controllers\DeTaiController::class, 'store']);
    Route::put('/de-tai/{id}', [\App\Http\Controllers\DeTaiController::class, 'update']);
    Route::put('/de-tai/{id}/cham-diem-hd', [\App\Http\Controllers\DeTaiController::class, 'chamDiemHD']);
    Route::put('/de-tai/{id}/cham-diem-pb', [\App\Http\Controllers\DeTaiController::class, 'chamDiemPB']);
    Route::put('/de-tai/{id}/cham-diem-gk', [\App\Http\Controllers\DeTaiController::class, 'chamDiemGK']);
    Route::delete('/de-tai/{id}', [\App\Http\Controllers\DeTaiController::class, 'destroy']);
    Route::get('/de-tai/{id}/export/gvhd', [\App\Http\Controllers\DeTaiController::class, 'exportGVHD']);
    Route::get('/de-tai/{id}/export/gvpb', [\App\Http\Controllers\DeTaiController::class, 'exportGVPB']);

    // API thống kê tổng quan (Dashboard)
    Route::get('/stats', [\App\Http\Controllers\StatsController::class, 'adminStats']);
    Route::get('/gv-stats', [\App\Http\Controllers\StatsController::class, 'gvStats']);
    Route::get('/sv-stats', [\App\Http\Controllers\StatsController::class, 'svStats']);

    // API: Lấy đề tài đăng ký của sinh viên hiện tại
    Route::get('/topic-registration-form/my', [\App\Http\Controllers\TopicRegistrationFormController::class, 'my']);
});

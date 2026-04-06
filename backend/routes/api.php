<?php

use App\Http\Middleware\ApiTokenAuth;
use App\Http\Controllers\ThesisFormController;
use App\Models\Council;
use App\Models\CouncilMember;
use App\Models\Score;
use App\Models\Setting;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\ThesisForm;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use PhpOffice\PhpSpreadsheet\Worksheet\Row;

Route::get('/', function () {
    return response()->json([
        'message' => 'Backend API is running',
    ]);
});

Route::post('/login', function (Request $request) {
    $tokenStore = Cache::store('file');
    $username = (string) $request->input('username', $request->input('maGV', ''));
    $password = (string) $request->input('password', $request->input('matKhau', ''));

    if ($username === '' || $password === '') {
        return response()->json([
            'message' => 'Thiếu thông tin đăng nhập.',
        ], 422);
    }

    $user = Teacher::where('maGV', $username)->first();

    if (!$user) {
        return response()->json([
            'message' => 'Thông tin đăng nhập giảng viên không chính xác.',
        ], 401);
    }

    $storedPassword = (string) $user->matKhau;
    $isValidPassword = $password === $storedPassword;

    if (!$isValidPassword) {
        return response()->json([
            'message' => 'Thông tin đăng nhập không chính xác.',
        ], 401);
    }
    $role_of_user = CouncilMember::where('maGV', $user->maGV)->pluck('vaiTro')->first() ?? 'UyVien';
    $token = (string) Str::uuid();
    $tokenStore->put('api_token:' . $token, [
        'role' => $role_of_user,
        'maGV' => $user->maGV,
    ], now()->addDays(7));

    return response()->json([
        'message' => 'Đăng nhập thành công.',
        'token' => $token,
        'token_type' => 'Bearer',
        'user' => [
            'role' => $role_of_user,
            'maGV' => $user->maGV,
            'tenGV' => $user->tenGV,
            'email' => $user->email,
            'soDienThoai' => $user->soDienThoai,
            'hocVi' => $user->hocVi,
        ],
    ]);
});

// BẮT ĐẦU KHU VỰC CẦN TOKEN (BẢO MẬT)
Route::middleware(ApiTokenAuth::class)->group(function () {
    Route::get('/me', function (Request $request) {
        $user = $request->attributes->get('auth_user');
        $role = (string) $request->attributes->get('auth_role', 'lecturer');

        return response()->json([
            'data' => [
                'maGV' => $user->maGV,
                'tenGV' => $user->tenGV,
                'email' => $user->email,
                'soDienThoai' => $user->soDienThoai,
                'hocVi' => $user->hocVi,
                'role' => $role,
            ],
        ]);
    });

    Route::post('/logout', function (Request $request) {
        $tokenStore = Cache::store('file');
        $token = $request->attributes->get('api_token');
        $tokenStore->forget('api_token:' . $token);

        return response()->json([
            'message' => 'Đăng xuất thành công.',
        ]);
    });

    Route::post('/change-password', function (Request $request) {
        $validated = $request->validate([
            'old_pass' => 'required|string',
            'new_pass' => 'required|string|min:3',
            'confirm_pass' => 'required|string|min:3|same:new_pass',
        ]);

        $role = (string) $request->attributes->get('auth_role', 'lecturer');

        if ($role === 'admin') {
            $tokenStore = Cache::store('file');
            $oldPassword = (string) $tokenStore->get('legacy_admin_password', '123');
            if (!hash_equals($oldPassword, $validated['old_pass'])) {
                return response()->json([
                    'message' => 'Mật khẩu cũ không chính xác.',
                ], 422);
            }

            $tokenStore->put('legacy_admin_password', $validated['new_pass'], now()->addDays(365));

            return response()->json([
                'message' => 'Đổi mật khẩu thành công.',
            ]);
        }

        $user = $request->attributes->get('auth_user');
        $storedPassword = (string) $user->matKhau;

        $isValidOld = Hash::check($validated['old_pass'], $storedPassword) || hash_equals($storedPassword, $validated['old_pass']);

        if (!$isValidOld) {
            return response()->json([
                'message' => 'Mật khẩu cũ không chính xác.',
            ], 422);
        }

        $user->update([
            'matKhau' => Hash::make($validated['new_pass']),
        ]);

        return response()->json([
            'message' => 'Đổi mật khẩu thành công.',
        ]);
    });

    Route::get('/dashboard', function () {
        $setting = Setting::firstOrCreate(
            ['id' => 1],
            ['trangThaiChamGK' => 0, 'giaiDoan' => 1]
        );

        return response()->json([
            'cauhinh' => $setting,
            'stats' => [
                'sinhvien' => Student::count(),
                'detai' => Topic::count(),
                'hoidong' => Council::count(),
            ],
        ]);
    });

    Route::put('/settings/stage', function (Request $request) {
        $validated = $request->validate([
            'next_stage' => 'nullable|integer|min:1',
            'reset_stage' => 'nullable|boolean',
        ]);

        $setting = Setting::firstOrCreate(['id' => 1], ['trangThaiChamGK' => 0, 'giaiDoan' => 1]);

        if (($validated['reset_stage'] ?? false) === true) {
            $setting->update(['giaiDoan' => 1]);
        } elseif (array_key_exists('next_stage', $validated)) {
            $setting->update(['giaiDoan' => $validated['next_stage']]);
        }

        return response()->json([
            'message' => 'Cập nhật giai đoạn thành công.',
            'data' => $setting->fresh(),
        ]);
    });

    Route::post('/settings/toggle-midterm', function () {
        $setting = Setting::firstOrCreate(['id' => 1], ['trangThaiChamGK' => 0, 'giaiDoan' => 1]);
        $newStatus = ((int) $setting->trangThaiChamGK === 1) ? 0 : 1;
        $setting->update(['trangThaiChamGK' => $newStatus]);

        return response()->json([
            'message' => $newStatus === 1 ? 'Đã MỞ hệ thống chấm điểm GK.' : 'Đã ĐÓNG hệ thống chấm điểm GK.',
            'data' => $setting->fresh(),
        ]);
    });

    // Students API RESTful
    Route::post('/students/import', function (Request $request) {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv',
        ]);

        $file = $request->file('file');
        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, true);

        if (count($rows) < 2) {
            return response()->json([
                'imported' => 0,
                'errors' => [['row' => 1, 'msg' => 'File không có dữ liệu.']],
            ], 422);
        }

        $headerRow = array_shift($rows);
        $headerMap = [];
        foreach ($headerRow as $col => $label) {
            $key = strtolower(trim((string) $label));
            $key = str_replace([' ', '-', '_'], '', $key);
            if (in_array($key, ['mssv', 'masv', 'masinhvien'], true)) {
                $headerMap['mssv'] = $col;
            } elseif (in_array($key, ['hoten', 'tensv', 'hovaten'], true)) {
                $headerMap['hoTen'] = $col;
            } elseif ($key === 'lop') {
                $headerMap['lop'] = $col;
            } elseif ($key === 'email') {
                $headerMap['email'] = $col;
            } elseif (in_array($key, ['sodienthoai', 'sdt', 'dienthoai'], true)) {
                $headerMap['soDienThoai'] = $col;
            }
        }

        if (!isset($headerMap['mssv']) || !isset($headerMap['hoTen'])) {
            return response()->json([
                'imported' => 0,
                'errors' => [[
                    'row' => 1,
                    'msg' => 'Thiếu cột bắt buộc: MSSV hoặc Họ tên.',
                ]],
            ], 422);
        }

        $imported = 0;
        $errors = [];

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;
            $mssv = trim((string) ($row[$headerMap['mssv']] ?? ''));
            $hoTen = trim((string) ($row[$headerMap['hoTen']] ?? ''));

            if ($mssv === '' && $hoTen === '') {
                continue;
            }

            if ($mssv === '' || $hoTen === '') {
                $errors[] = ['row' => $rowNumber, 'msg' => 'Thiếu MSSV hoặc Họ tên.'];
                continue;
            }

            if (Student::where('mssv', $mssv)->exists()) {
                $errors[] = ['row' => $rowNumber, 'msg' => 'MSSV đã tồn tại.'];
                continue;
            }

            Student::create([
                'mssv' => $mssv,
                'hoTen' => $hoTen,
                'lop' => isset($headerMap['lop']) ? trim((string) ($row[$headerMap['lop']] ?? '')) : null,
                'email' => isset($headerMap['email']) ? trim((string) ($row[$headerMap['email']] ?? '')) : null,
                'soDienThoai' => isset($headerMap['soDienThoai']) ? trim((string) ($row[$headerMap['soDienThoai']] ?? '')) : null,
            ]);
            $imported++;
        }

        return response()->json([
            'imported' => $imported,
            'errors' => $errors,
        ]);
    });
    Route::get('/students', [\App\Http\Controllers\StudentController::class, 'index']);
    Route::get('/students/{student}', [\App\Http\Controllers\StudentController::class, 'show']);
    Route::post('/students', [\App\Http\Controllers\StudentController::class, 'store']);
    Route::put('/students/{student}', [\App\Http\Controllers\StudentController::class, 'update']);
    Route::delete('/students/{student}', [\App\Http\Controllers\StudentController::class, 'destroy']);
    Route::delete('/students', [\App\Http\Controllers\StudentController::class, 'destroyAll']);

    // Lecturers API RESTful
    Route::get('/lecturers', [\App\Http\Controllers\LecturerController::class, 'index']);
    Route::get('/lecturers/{lecturer}', [\App\Http\Controllers\LecturerController::class, 'show']);
    Route::post('/lecturers', [\App\Http\Controllers\LecturerController::class, 'store']);
    Route::put('/lecturers/{lecturer}', [\App\Http\Controllers\LecturerController::class, 'update']);
    Route::delete('/lecturers/{lecturer}', [\App\Http\Controllers\LecturerController::class, 'destroy']);

    Route::get('/councils', function () {
        return response()->json([
            'data' => Council::with('members')->orderBy('maHoiDong', 'desc')->get(),
        ]);
    });

    Route::get('/councils/{council}', function (Council $council) {
        return response()->json([
            'data' => $council->load('members'),
        ]);
    });

    Route::post('/councils', function (Request $request) {
        $validated = $request->validate([
            'tenHoiDong' => 'required|string|max:255',
            'diaDiem' => 'nullable|string|max:255',
            'chuTich' => 'required|exists:giangvien,maGV',
            'thuKy1' => 'required|exists:giangvien,maGV',
            'thuKy2' => 'nullable|exists:giangvien,maGV',
            'uyVien' => 'required|exists:giangvien,maGV',
        ]);

        $members = [$validated['chuTich'], $validated['thuKy1'], $validated['uyVien']];
        if (!empty($validated['thuKy2'])) {
            $members[] = $validated['thuKy2'];
        }

        if (count($members) !== count(array_unique($members))) {
            return response()->json([
                'message' => 'Một giảng viên không thể giữ nhiều vai trò trong cùng một hội đồng.',
            ], 422);
        }

        $council = DB::transaction(function () use ($validated) {
            $council = Council::create([
                'tenHoiDong' => $validated['tenHoiDong'],
                'diaDiem' => $validated['diaDiem'] ?? null,
            ]);

            CouncilMember::create(['maHoiDong' => $council->maHoiDong, 'maGV' => $validated['chuTich'], 'vaiTro' => 'ChuTich']);
            CouncilMember::create(['maHoiDong' => $council->maHoiDong, 'maGV' => $validated['thuKy1'], 'vaiTro' => 'ThuKy']);
            if (!empty($validated['thuKy2'])) {
                CouncilMember::create(['maHoiDong' => $council->maHoiDong, 'maGV' => $validated['thuKy2'], 'vaiTro' => 'ThuKy']);
            }
            CouncilMember::create(['maHoiDong' => $council->maHoiDong, 'maGV' => $validated['uyVien'], 'vaiTro' => 'UyVien']);

            return $council;
        });

        return response()->json([
            'data' => $council->load('members'),
        ], 201);
    });

    Route::put('/councils/{council}', function (Request $request, Council $council) {
        $validated = $request->validate([
            'tenHoiDong' => 'required|string|max:255',
            'diaDiem' => 'nullable|string|max:255',
            'chuTich' => 'required|exists:giangvien,maGV',
            'thuKy1' => 'required|exists:giangvien,maGV',
            'thuKy2' => 'nullable|exists:giangvien,maGV',
            'uyVien' => 'required|exists:giangvien,maGV',
        ]);

        $members = [$validated['chuTich'], $validated['thuKy1'], $validated['uyVien']];
        if (!empty($validated['thuKy2'])) {
            $members[] = $validated['thuKy2'];
        }

        if (count($members) !== count(array_unique($members))) {
            return response()->json([
                'message' => 'Một giảng viên không thể giữ nhiều vai trò trong cùng một hội đồng.',
            ], 422);
        }

        DB::transaction(function () use ($validated, $council) {
            $council->update([
                'tenHoiDong' => $validated['tenHoiDong'],
                'diaDiem' => $validated['diaDiem'] ?? null,
            ]);

            CouncilMember::where('maHoiDong', $council->maHoiDong)->delete();
            CouncilMember::create(['maHoiDong' => $council->maHoiDong, 'maGV' => $validated['chuTich'], 'vaiTro' => 'ChuTich']);
            CouncilMember::create(['maHoiDong' => $council->maHoiDong, 'maGV' => $validated['thuKy1'], 'vaiTro' => 'ThuKy']);
            if (!empty($validated['thuKy2'])) {
                CouncilMember::create(['maHoiDong' => $council->maHoiDong, 'maGV' => $validated['thuKy2'], 'vaiTro' => 'ThuKy']);
            }
            CouncilMember::create(['maHoiDong' => $council->maHoiDong, 'maGV' => $validated['uyVien'], 'vaiTro' => 'UyVien']);
        });

        return response()->json([
            'data' => $council->fresh()->load('members'),
        ]);
    });

    Route::delete('/councils/{council}', function (Council $council) {
        DB::transaction(function () use ($council) {
            Topic::where('maHoiDong', $council->maHoiDong)->update(['maHoiDong' => null]);
            CouncilMember::where('maHoiDong', $council->maHoiDong)->delete();
            $council->delete();
        });

        return response()->json([
            'message' => 'Đã xóa hội đồng',
        ]);
    });

    Route::get('/topics', function (Request $request) {
        $query = Topic::with(['lecturer', 'reviewer', 'council', 'students'])->orderBy('maDeTai', 'desc');

        if ($request->filled('type') && $request->string('type')->toString() === 'PB') {
            $query->whereNotNull('maGV_PB');
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    });

    Route::get('/topics/{topic}', function (Topic $topic) {
        return response()->json([
            'data' => $topic->load(['lecturer', 'reviewer', 'council', 'students']),
        ]);
    });

    Route::get('/topics/{topic}/students', function (Topic $topic) {
        return response()->json([
            'data' => $topic->students()->orderBy('mssv')->get(),
        ]);
    });

    Route::put('/topics/{topic}', function (Request $request, Topic $topic) {
        $validated = $request->validate([
            'maMH' => 'nullable|string|max:20',
            'tenMonHoc' => 'nullable|string|max:255',
            'tenDeTai' => 'nullable|string|max:255',
            'maGV_HD' => 'nullable|exists:giangvien,maGV',
            'maGV_PB' => 'nullable|exists:giangvien,maGV',
            'maHoiDong' => 'nullable|exists:hoidong,maHoiDong',
            'ghiChu' => 'nullable|string',
            'ghiChu_PB' => 'nullable|string',
            'diemGiuaKy' => 'nullable|numeric|min:0|max:100',
            'trangThaiGiuaKy' => 'nullable|in:duoc_lam_tiep,dinh_chi,canh_cao',
            'nhanXetGiuaKy' => 'nullable|string',
            'diemHuongDan' => 'nullable|numeric|min:0|max:10',
            'diemPhanBien' => 'nullable|numeric|min:0|max:10',
            'nhanXetPhanBien' => 'nullable|string',
            'diemHoiDong' => 'nullable|numeric|min:0|max:10',
            'nhanXetHoiDong' => 'nullable|string',
            'diemTongKet' => 'nullable|numeric|min:0|max:10',
            'diemChu' => 'nullable|string|max:5',
            'trangThaiHoiDong' => 'nullable|in:dat,can_chinh_sua,khong_dat',
        ]);

        if (!empty($validated['maGV_HD']) && !empty($validated['maGV_PB']) && $validated['maGV_HD'] === $validated['maGV_PB']) {
            return response()->json([
                'message' => 'GVPB không được trùng GVHD.',
            ], 422);
        }

        if (!empty($validated['maGV_HD']) && $validated['maGV_HD'] !== $topic->maGV_HD) {
            $studentCount = Student::whereHas('topic', function ($query) use ($validated) {
                $query->where('maGV_HD', $validated['maGV_HD']);
            })->count();

            $currentTopicStudents = Student::where('maDeTai', $topic->maDeTai)->count();

            if (($studentCount + $currentTopicStudents) > 10) {
                return response()->json([
                    'message' => 'GVHD đã đủ 10 sinh viên, không thể phân công thêm.',
                ], 422);
            }
        }

        $topic->update($validated);

        return response()->json([
            'message' => 'Cập nhật đề tài thành công.',
            'data' => $topic->fresh()->load(['lecturer', 'reviewer', 'council', 'students']),
        ]);
    });

    Route::post('/topics/create-group-assign', function (Request $request) {
        $validated = $request->validate([
            'student_1' => 'required|exists:sinhvien,mssv',
            'student_2' => 'nullable|exists:sinhvien,mssv|different:student_1',
            'maMH' => 'required|string|max:20',
            'maGV_HD' => 'required|exists:giangvien,maGV',
        ]);

        $topic = DB::transaction(function () use ($validated) {
            $topic = Topic::create([
                'tenDeTai' => 'Chưa cập nhật tên đề tài',
                'maMH' => $validated['maMH'],
                'maGV_HD' => $validated['maGV_HD'],
                'maGV_PB' => null,
                'trangThaiGiuaKy' => 'duoc_lam_tiep',
            ]);

            Student::where('mssv', $validated['student_1'])->update(['maDeTai' => $topic->maDeTai]);
            if (!empty($validated['student_2'])) {
                Student::where('mssv', $validated['student_2'])->update(['maDeTai' => $topic->maDeTai]);
            }

            return $topic;
        });

        return response()->json([
            'message' => 'Tạo nhóm thành công.',
            'data' => $topic->load(['lecturer', 'reviewer', 'students']),
        ], 201);
    });

    Route::delete('/topics', function () {
        DB::transaction(function () {
            Student::query()->update(['maDeTai' => null]);
            Topic::truncate();
        });

        return response()->json([
            'message' => 'Đã xóa tất cả đề tài.',
        ]);
    });

    Route::patch('/topics/{topic}/status', function (Request $request, Topic $topic) {
        $validated = $request->validate([
            'status' => 'required|in:duoc_lam_tiep,dinh_chi,canh_cao'
        ]);

        $topic->update([
            'trangThaiGiuaKy' => $validated['status']
        ]);

        return response()->json([
            'message' => 'Cập nhật trạng thái duyệt thành công!',
            'data' => $topic->fresh(),
        ]);
    });

    Route::post('/topics/assign-hoidong', function (Request $request) {
        $validated = $request->validate([
            'maHoiDong' => 'required|exists:hoidong,maHoiDong',
            'maDeTai' => 'required|array|min:1',
            'maDeTai.*' => 'required|integer|exists:detai,maDeTai',
        ]);

        $blocked = Topic::whereIn('maDeTai', $validated['maDeTai'])
            ->where('trangThaiGiuaKy', 'dinh_chi')
            ->pluck('tenDeTai')
            ->all();

        if (!empty($blocked)) {
            return response()->json([
                'message' => 'Có đề tài bị đình chỉ, không thể gán hội đồng.',
                'detai' => $blocked,
            ], 422);
        }

        Topic::whereIn('maDeTai', $validated['maDeTai'])->update(['maHoiDong' => $validated['maHoiDong']]);

        return response()->json([
            'message' => 'Gán đề tài vào hội đồng thành công.',
        ]);
    });

    Route::post('/topics/council-score', function (Request $request) {
        $validated = $request->validate([
            'scores' => 'required|array|min:1',
            'scores.*.maDeTai' => 'required|integer|exists:detai,maDeTai',
            'scores.*.diemHoiDong' => 'required|numeric|min:0|max:100',
            'scores.*.nhanXetHoiDong' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['scores'] as $scoreItem) {
                $topic = Topic::findOrFail($scoreItem['maDeTai']);

                $diemHD = $topic->diemHuongDan !== null ? (float) $topic->diemHuongDan : 0.0;
                $diemPB = $topic->diemPhanBien !== null ? (float) $topic->diemPhanBien : 0.0;
                $diemHoiDong = (float) $scoreItem['diemHoiDong'];

                $diemTongKet = round(($diemHD * 0.2) + ($diemPB * 0.2) + ($diemHoiDong * 0.6), 1);

                $diemChu = 'F';
                if ($diemTongKet >= 9.0) {
                    $diemChu = 'A+';
                } elseif ($diemTongKet >= 8.5) {
                    $diemChu = 'A';
                } elseif ($diemTongKet >= 8.0) {
                    $diemChu = 'B+';
                } elseif ($diemTongKet >= 7.0) {
                    $diemChu = 'B';
                } elseif ($diemTongKet >= 6.5) {
                    $diemChu = 'C+';
                } elseif ($diemTongKet >= 5.5) {
                    $diemChu = 'C';
                } elseif ($diemTongKet >= 5.0) {
                    $diemChu = 'D+';
                } elseif ($diemTongKet >= 4.0) {
                    $diemChu = 'D';
                }

                $topic->update([
                    'diemHoiDong' => $diemHoiDong,
                    'nhanXetHoiDong' => $scoreItem['nhanXetHoiDong'] ?? '',
                    'diemTongKet' => $diemTongKet,
                    'diemChu' => $diemChu,
                ]);
            }
        });

        return response()->json([
            'message' => 'Lưu điểm hội đồng thành công.',
        ]);
    });

    Route::post('/topics/{topic}/score-gvhd', function (Request $request, Topic $topic) {
        $validated = $request->validate([
            'maxPhanTich' => 'required|numeric|min:0',
            'maxThietKe' => 'required|numeric|min:0',
            'maxHienThuc' => 'required|numeric|min:0',
            'maxBaoCao' => 'required|numeric|min:0',
            'diemPhanTich1' => 'required|numeric|min:0',
            'diemThietKe1' => 'required|numeric|min:0',
            'diemHienThuc1' => 'required|numeric|min:0',
            'diemBaoCao1' => 'required|numeric|min:0',
            'diemPhanTich2' => 'nullable|numeric|min:0',
            'diemThietKe2' => 'nullable|numeric|min:0',
            'diemHienThuc2' => 'nullable|numeric|min:0',
            'diemBaoCao2' => 'nullable|numeric|min:0',
        ]);

        $totalMax = (float) $validated['maxPhanTich'] + (float) $validated['maxThietKe'] + (float) $validated['maxHienThuc'] + (float) $validated['maxBaoCao'];
        if ($totalMax == 0.0) {
            $totalMax = 10.0;
        }

        $s1 = (float) $validated['diemPhanTich1'] + (float) $validated['diemThietKe1'] + (float) $validated['diemHienThuc1'] + (float) $validated['diemBaoCao1'];
        $final1 = ($s1 / $totalMax) * 10;

        $s2 = (float) ($validated['diemPhanTich2'] ?? 0) + (float) ($validated['diemThietKe2'] ?? 0) + (float) ($validated['diemHienThuc2'] ?? 0) + (float) ($validated['diemBaoCao2'] ?? 0);
        $diemTongKetHD = $final1;

        if ($s2 > 0) {
            $final2 = ($s2 / $totalMax) * 10;
            $diemTongKetHD = ($final1 + $final2) / 2;
        }

        $topic->update(['diemHuongDan' => $diemTongKetHD]);

        return response()->json([
            'message' => 'Lưu điểm GVHD thành công.',
            'data' => $topic->fresh(),
        ]);
    });

    Route::post('/topics/{topic}/score-gvpb', function (Request $request, Topic $topic) {
        $validated = $request->validate([
            'maxPhanTich' => 'required|numeric|min:0',
            'maxThietKe' => 'required|numeric|min:0',
            'maxHienThuc' => 'required|numeric|min:0',
            'maxBaoCao' => 'required|numeric|min:0',
            'diemPhanTich1_PB' => 'required|numeric|min:0',
            'diemThietKe1_PB' => 'required|numeric|min:0',
            'diemHienThuc1_PB' => 'required|numeric|min:0',
            'diemBaoCao1_PB' => 'required|numeric|min:0',
            'diemPhanTich2_PB' => 'nullable|numeric|min:0',
            'diemThietKe2_PB' => 'nullable|numeric|min:0',
            'diemHienThuc2_PB' => 'nullable|numeric|min:0',
            'diemBaoCao2_PB' => 'nullable|numeric|min:0',
        ]);

        $totalMax = (float) $validated['maxPhanTich'] + (float) $validated['maxThietKe'] + (float) $validated['maxHienThuc'] + (float) $validated['maxBaoCao'];
        if ($totalMax == 0.0) {
            $totalMax = 10.0;
        }

        $s1 = (float) $validated['diemPhanTich1_PB'] + (float) $validated['diemThietKe1_PB'] + (float) $validated['diemHienThuc1_PB'] + (float) $validated['diemBaoCao1_PB'];
        $final1 = ($s1 / $totalMax) * 10;

        $s2 = (float) ($validated['diemPhanTich2_PB'] ?? 0) + (float) ($validated['diemThietKe2_PB'] ?? 0) + (float) ($validated['diemHienThuc2_PB'] ?? 0) + (float) ($validated['diemBaoCao2_PB'] ?? 0);
        $diemTongKetPB = $final1;

        if ($s2 > 0) {
            $final2 = ($s2 / $totalMax) * 10;
            $diemTongKetPB = ($final1 + $final2) / 2;
        }

        $topic->update(['diemPhanBien' => $diemTongKetPB]);

        return response()->json([
            'message' => 'Lưu điểm GVPB thành công.',
            'data' => $topic->fresh(),
        ]);
    });

    Route::get('/scores', function (Request $request) {
        $query = Score::with(['topic', 'lecturer'])->orderBy('maDiem', 'desc');

        if ($request->filled('maDeTai')) {
            $query->where('maDeTai', $request->integer('maDeTai'));
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    });

    Route::post('/scores', function (Request $request) {
        $validated = $request->validate([
            'maDeTai' => 'required|exists:detai,maDeTai',
            'maGV' => 'required|exists:giangvien,maGV',
            'loaiDiem' => 'required|in:huong_dan,phan_bien,hoi_dong',
            'diemSo' => 'required|numeric|min:0|max:100',
            'nhanXet' => 'nullable|string',
        ]);

        $score = Score::create($validated);

        return response()->json([
            'data' => $score->load(['topic', 'lecturer']),
        ], 201);
    });

    Route::put('/scores/{score}', function (Request $request, Score $score) {
        $validated = $request->validate([
            'maDeTai' => 'sometimes|exists:detai,maDeTai',
            'maGV' => 'sometimes|exists:giangvien,maGV',
            'loaiDiem' => 'sometimes|in:huong_dan,phan_bien,hoi_dong',
            'diemSo' => 'sometimes|numeric|min:0|max:100',
            'nhanXet' => 'sometimes|nullable|string',
        ]);

        $score->update($validated);

        return response()->json([
            'data' => $score->fresh()->load(['topic', 'lecturer']),
        ]);
    });

    Route::delete('/scores/{score}', function (Score $score) {
        $score->delete();

        return response()->json([
            'message' => 'Đã xóa điểm.',
        ]);
    });

    Route::get('/options', function () {
        return response()->json([
            'giangvien' => Teacher::orderBy('tenGV')->get(['maGV', 'tenGV']),
            'sinhvien' => Student::whereNull('maDeTai')->orderBy('hoTen')->get(['mssv', 'hoTen']),
            'hoidong' => Council::orderBy('tenHoiDong')->get(['maHoiDong', 'tenHoiDong']),
        ]);
    });

    /*
        Thông tin Form đăng ký làm đồ án tốt nghiệp (ThesisForm) 
    */
    Route::get('/thesis-form', function (Request $request) {
        $role = (string) $request->attributes->get('auth_role', '');
        if ($role !== 'ThuKy') {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập chức năng này.'
            ], 403);
        }
        return app(ThesisFormController::class)->index($request);
    });
    Route::post('/thesis-form', [ThesisFormController::class, 'store']);
    Route::put('/thesis-form/{form}', [ThesisFormController::class, 'update']);
    Route::delete('/thesis-form/{form}', [ThesisFormController::class, 'destroy']);
    Route::delete('/thesis-forms', [ThesisFormController::class, 'destroyAll']);

    // ==========================================
    // KHU VỰC IMPORT EXCEL (Nạp dữ liệu từ file KQ_QUATRINHTHUCHIEN)
    // ==========================================
    Route::post('/imports/excel/full-data', function (Request $request) {
        $request->validate(['file' => 'required|mimes:xlsx,xls,csv']);

        $file = $request->file('file');
        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
        $data = $spreadsheet->getActiveSheet()->toArray();

        $count = 0;
        try {
            DB::transaction(function () use ($data, &$count) {
                foreach ($data as $index => $row) {
                    if ($index < 1 || empty($row[1])) continue; // Bỏ qua header và dòng trống

                    // 1. Tạo/Cập nhật GVHD (Cột F)
                    $gvhd = Teacher::firstOrCreate(
                        ['tenGV' => $row[5]],
                        ['maGV' => 'GV'.Str::random(5)] 
                    );

                    // 2. Tạo/Cập nhật Đề tài (Cột E)
                    $topic = Topic::updateOrCreate(
                        ['tenDeTai' => $row[4]],
                        [
                            'maGV_HD' => $gvhd->maGV,
                            'diemHuongDan' => $row[6] ?? null,
                            'diemPhanBien' => $row[7] ?? null,
                        ]
                    );

                    // 3. Tạo/Cập nhật Sinh viên (Cột B, C, D)
                    Student::updateOrCreate(
                        ['mssv' => $row[1]],
                        [
                            'hoTen' => $row[2],
                            'lop' => $row[3],
                            'maDeTai' => $topic->maDeTai
                        ]
                    );
                    $count++;
                }
            });
            return response()->json(['message' => "Đã import thành công $count dòng dữ liệu!"]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi Import: ' . $e->getMessage()], 500);
        }
    });

    // ==========================================
    // KHU VỰC EXPORT WORD (- Nhận diện Nhóm/Cá nhân)
    // ==========================================
    Route::get('/exports/word/assignment/{topic}', function (Topic $topic) {
        $topic->load(['students', 'lecturer']);
        $template = new \PhpOffice\PhpWord\TemplateProcessor(base_path('huong_dan/Form_NhiemvuLVTN.docx'));
        $sv1 = $topic->students->first();
        $sv2 = $topic->students->skip(1)->first();
        $template->setValue('tenDeTai', $topic->tenDeTai ?? '');
        $template->setValue('tenGVHD', $topic->lecturer->tenGV ?? '');
        $template->setValue('tenSV1', $sv1->hoTen ?? '');
        $template->setValue('mssv1', $sv1->mssv ?? '');
        $template->setValue('lop1', $sv1->lop ?? '');
        $template->setValue('tenSV2', $sv2->hoTen ?? '');
        $template->setValue('mssv2', $sv2->mssv ?? '');
        $template->setValue('lop2', $sv2->lop ?? '');
        $path = storage_path('app/temp_nv_' . $topic->maDeTai . '.docx');
        $template->saveAs($path);
        return response()->download($path)->deleteFileAfterSend(true);
    });

    Route::get('/exports/word/gvhd/{topic}', function (Topic $topic) {
        $topic->load(['students', 'lecturer']);
        $file = $topic->students->count() > 1
            ? 'Mau 01.01_PHIEU CHAM_HUONG DAN_NHOM SINH VIEN.docx'
            : 'Mau 01.02_PHIEU CHAM_HUONG DAN_SINH VIEN.docx';
        $template = new \PhpOffice\PhpWord\TemplateProcessor(base_path('huong_dan/' . $file));
        $sv1 = $topic->students->first();
        $sv2 = $topic->students->skip(1)->first();
        $template->setValue('tenDeTai', $topic->tenDeTai ?? '');
        $template->setValue('tenGV', $topic->lecturer->tenGV ?? '');
        $template->setValue('tenSV1', $sv1->hoTen ?? '');
        $template->setValue('mssv1', $sv1->mssv ?? '');
        $template->setValue('lop1', $sv1->lop ?? '');
        $template->setValue('tenSV2', $sv2->hoTen ?? '');
        $template->setValue('mssv2', $sv2->mssv ?? '');
        $template->setValue('lop2', $sv2->lop ?? '');
        $path = storage_path('app/temp_hd_' . $topic->maDeTai . '.docx');
        $template->saveAs($path);
        return response()->download($path)->deleteFileAfterSend(true);
    });

    Route::get('/exports/word/gvpb/{topic}', function (Topic $topic) {
        $topic->load(['students', 'reviewer']);
        $file = $topic->students->count() > 1
            ? 'Mau 02.01_PHIEU CHAM_PHAN BIEN_NHOM SINH VIEN.docx'
            : 'Mau 02.02_PHIEU CHAM_PHAN BIEN_SINH VIEN.docx';
        $template = new \PhpOffice\PhpWord\TemplateProcessor(base_path('huong_dan/' . $file));
        $sv1 = $topic->students->first();
        $sv2 = $topic->students->skip(1)->first();
        $template->setValue('tenDeTai', $topic->tenDeTai ?? '');
        $template->setValue('tenGVPB', $topic->reviewer->tenGV ?? '');
        $template->setValue('tenSV1', $sv1->hoTen ?? '');
        $template->setValue('mssv1', $sv1->mssv ?? '');
        $template->setValue('lop1', $sv1->lop ?? '');
        $template->setValue('tenSV2', $sv2->hoTen ?? '');
        $template->setValue('mssv2', $sv2->mssv ?? '');
        $template->setValue('lop2', $sv2->lop ?? '');
        $path = storage_path('app/temp_pb_' . $topic->maDeTai . '.docx');
        $template->saveAs($path);
        return response()->download($path)->deleteFileAfterSend(true);
    });

    // ==========================================
    // KHU VỰC EXPORT EXCEL (- Dựng bảng xịn)
    // ==========================================
    Route::get('/exports/excel/danhsach', function () {
        $topics = Topic::with(['students', 'lecturer', 'reviewer', 'council'])->get();
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Danh Sach Sinh Vien');

        $headers = ['STT', 'MSSV', 'HỌ VÀ TÊN', 'LỚP', 'TÊN ĐỀ TÀI', 'GVHD', 'GVPB', 'UỶ VIÊN'];
        $sheet->fromArray($headers, null, 'A1');
        $sheet->getStyle('A1:H1')->getFont()->setBold(true);

        $row = 2;
        $stt = 1;

        foreach ($topics as $topic) {
            $tenUyVien = '';
            if ($topic->council) {
                $maGV_UyVien = CouncilMember::where('maHoiDong', $topic->maHoiDong)->where('vaiTro', 'UyVien')->value('maGV');
                if ($maGV_UyVien) $tenUyVien = Teacher::where('maGV', $maGV_UyVien)->value('tenGV');
            }

            foreach ($topic->students as $student) {
                $sheet->setCellValue('A' . $row, $stt++);
                $sheet->setCellValueExplicit('B' . $row, $student->mssv, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                $sheet->setCellValue('C' . $row, $student->hoTen);
                $sheet->setCellValue('D' . $row, $student->lop);
                $sheet->setCellValue('E' . $row, $topic->tenDeTai);
                $sheet->setCellValue('F' . $row, $topic->lecturer->tenGV ?? '');
                $sheet->setCellValue('G' . $row, $topic->reviewer->tenGV ?? '');
                $sheet->setCellValue('H' . $row, $tenUyVien);
                $row++;
            }
        }

        foreach (range('A', 'H') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $fileName = 'DanhSach_SVSinhVien_LVTN_' . date('Y_m_d_His') . '.xlsx';
        $tempPath = storage_path('app/' . $fileName);
        
        $writer->save($tempPath);
        return response()->download($tempPath, $fileName)->deleteFileAfterSend(true);
    });

    // Nếu chưa login mà cố gắng truy cập API, trả về lỗi 401 Unauthorized
    Route::middleware('auth.api')->any('/{any}', function () {
        return response()->json([
            'message' => 'Unauthorized. Vui lòng đăng nhập để truy cập API.',
        ], 401);
    })->where('any', '.*');

}); 
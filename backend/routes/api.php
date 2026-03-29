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
    // $isLegacyPlainText = hash_equals($storedPassword, $password);
    // $isValidPassword = Hash::check($password, $storedPassword) || $isLegacyPlainText;
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
    Route::get('/students', [\App\Http\Controllers\StudentController::class, 'index']);
    Route::get('/students/{student}', [\App\Http\Controllers\StudentController::class, 'show']);
    Route::post('/students', [\App\Http\Controllers\StudentController::class, 'store']);
    Route::put('/students/{student}', [\App\Http\Controllers\StudentController::class, 'update']);
    Route::delete('/students/{student}', [\App\Http\Controllers\StudentController::class, 'destroy']);
    Route::delete('/students', [\App\Http\Controllers\StudentController::class, 'destroyAll']);

    Route::get('/lecturers', function () {
        return response()->json([
            'data' => Teacher::orderBy('maGV', 'desc')->get(),
        ]);
    });

    Route::get('/lecturers/{lecturer}', function (Teacher $lecturer) {
        return response()->json([
            'data' => $lecturer,
        ]);
    });

    Route::post('/lecturers', function (Request $request) {
        $validated = $request->validate([
            'maGV' => 'required|string|max:20|unique:giangvien,maGV',
            'tenGV' => 'required|string|max:100',
            'email' => 'nullable|email|max:100|unique:giangvien,email',
            'soDienThoai' => 'nullable|string|max:15',
            'hocVi' => 'nullable|string|max:50',
            'matKhau' => 'required|string|min:3',
        ]);

        $validated['matKhau'] = Hash::make($validated['matKhau']);

        $lecturer = Teacher::create($validated);

        return response()->json([
            'data' => $lecturer,
        ], 201);
    });

    Route::put('/lecturers/{lecturer}', function (Request $request, Teacher $lecturer) {
        $validated = $request->validate([
            'maGV' => ['required', 'string', 'max:20', Rule::unique('giangvien', 'maGV')->ignore($lecturer->maGV, 'maGV')],
            'tenGV' => 'required|string|max:100',
            'email' => ['nullable', 'email', 'max:100', Rule::unique('giangvien', 'email')->ignore($lecturer->maGV, 'maGV')],
            'soDienThoai' => 'nullable|string|max:15',
            'hocVi' => 'nullable|string|max:50',
            'matKhau' => 'nullable|string|min:3',
        ]);

        if (!empty($validated['matKhau'])) {
            $validated['matKhau'] = Hash::make($validated['matKhau']);
        } else {
            unset($validated['matKhau']);
        }

        $lecturer->update($validated);

        return response()->json([
            'data' => $lecturer,
        ]);
    });

    Route::delete('/lecturers/{lecturer}', function (Teacher $lecturer) {
        $lecturer->delete();

        return response()->json([
            'message' => 'Đã xóa giảng viên',
        ]);
    });

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
                'trangThaiGiuaKy' => 'Được làm tiếp',
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
        // Lecturers API RESTful
        Route::get('/lecturers', [\App\Http\Controllers\LecturerController::class, 'index']);
        Route::get('/lecturers/{lecturer}', [\App\Http\Controllers\LecturerController::class, 'show']);
        Route::post('/lecturers', [\App\Http\Controllers\LecturerController::class, 'store']);
        Route::put('/lecturers/{lecturer}', [\App\Http\Controllers\LecturerController::class, 'update']);
        Route::delete('/lecturers/{lecturer}', [\App\Http\Controllers\LecturerController::class, 'destroy']);
    });

    // API Duyệt / Từ chối đề tài (Phát chèn thêm)
    Route::patch('/topics/{topic}/status', function (Request $request, Topic $topic) {
        $validated = $request->validate([
            'status' => 'required|in:Được làm tiếp,Đình chỉ,Cảnh cáo,Chờ duyệt'
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
            ->where('trangThaiGiuaKy', 'Đình chỉ')
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

    Route::get('/topics/{topic}', function (Topic $topic) {
        return response()->json([
            'data' => $topic->load(['lecturer', 'reviewer', 'council', 'students']),
        ]);
    });

    Route::post('/topics', function (Request $request) {
        $validated = $request->validate([
            'maMH' => 'nullable|string|max:20|unique:detai,maMH',
            'tenMonHoc' => 'nullable|string|max:100',
            'tenDeTai' => 'required|string',
            'maGV_HD' => 'nullable|exists:giangvien,maGV',
            'maGV_PB' => 'nullable|exists:giangvien,maGV',
            'ghiChu_PB' => 'nullable|string',
            'ghiChu' => 'nullable|string',
            'diemGiuaKy' => 'nullable|numeric|min:0|max:100',
            'trangThaiGiuaKy' => 'nullable|in:Được làm tiếp,Đình chỉ,Cảnh cáo',
            'nhanXetGiuaKy' => 'nullable|string',
            'maHoiDong' => 'nullable|exists:hoidong,maHoiDong',
            'diemPhanBien' => 'nullable|numeric|min:0|max:100',
            'nhanXetPhanBien' => 'nullable|string',
            'diemHuongDan' => 'nullable|numeric|min:0|max:100',
            'diemHoiDong' => 'nullable|numeric|min:0|max:100',
            'nhanXetHoiDong' => 'nullable|string',
            'diemTongKet' => 'nullable|numeric|min:0|max:100',
            'diemChu' => 'nullable|string|max:5',
            'trangThaiHoiDong' => 'nullable|string|max:50',
        ]);

        if (!array_key_exists('trangThaiGiuaKy', $validated) || $validated['trangThaiGiuaKy'] === null) {
            $validated['trangThaiGiuaKy'] = 'Được làm tiếp';
        }

        $topic = Topic::create($validated);

        return response()->json([
            'data' => $topic->load(['lecturer', 'reviewer', 'council', 'students']),
        ], 201);
    });

    Route::put('/topics/{topic}', function (Request $request, Topic $topic) {
        $validated = $request->validate([
            'maMH' => ['sometimes', 'nullable', 'string', 'max:20', Rule::unique('detai', 'maMH')->ignore($topic->maDeTai, 'maDeTai')],
            'tenMonHoc' => 'sometimes|nullable|string|max:100',
            'tenDeTai' => 'sometimes|required|string',
            'maGV_HD' => 'sometimes|nullable|exists:giangvien,maGV',
            'maGV_PB' => 'sometimes|nullable|exists:giangvien,maGV',
            'ghiChu_PB' => 'sometimes|nullable|string',
            'ghiChu' => 'sometimes|nullable|string',
            'diemGiuaKy' => 'sometimes|nullable|numeric|min:0|max:100',
            'trangThaiGiuaKy' => 'sometimes|nullable|in:Được làm tiếp,Đình chỉ,Cảnh cáo',
            'nhanXetGiuaKy' => 'sometimes|nullable|string',
            'maHoiDong' => 'sometimes|nullable|exists:hoidong,maHoiDong',
            'diemPhanBien' => 'sometimes|nullable|numeric|min:0|max:100',
            'nhanXetPhanBien' => 'sometimes|nullable|string',
            'diemHuongDan' => 'sometimes|nullable|numeric|min:0|max:100',
            'diemHoiDong' => 'sometimes|nullable|numeric|min:0|max:100',
            'nhanXetHoiDong' => 'sometimes|nullable|string',
            'diemTongKet' => 'sometimes|nullable|numeric|min:0|max:100',
            'diemChu' => 'sometimes|nullable|string|max:5',
            'trangThaiHoiDong' => 'sometimes|nullable|string|max:50',
        ]);

        $topic->update($validated);

        return response()->json([
            'data' => $topic->load(['lecturer', 'reviewer', 'council', 'students']),
        ]);
    });

    Route::delete('/topics/{topic}', function (Topic $topic) {
        Student::where('maDeTai', $topic->maDeTai)->update(['maDeTai' => null]);
        $topic->delete();

        return response()->json([
            'message' => 'Đã xóa đề tài',
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
            'loaiDiem' => 'required|in:HuongDan,PhanBien,HoiDong',
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
            'loaiDiem' => 'sometimes|in:HuongDan,PhanBien,HoiDong',
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



    // Các route import/export Excel/Word tạm thời trả về lỗi 501 Not Implemented
    Route::any('/students/import-excel', function () {
        return response()->json([
            'message' => 'Chức năng import Excel chưa được hỗ trợ.'
        ], 501);
    });
    Route::any('/exports/midterm', function () {
        return response()->json([
            'message' => 'Chức năng export midterm chưa được hỗ trợ.'
        ], 501);
    });
    Route::any('/exports/hoidong', function () {
        return response()->json([
            'message' => 'Chức năng export hội đồng chưa được hỗ trợ.'
        ], 501);
    });
    Route::any('/exports/phanbien', function () {
        return response()->json([
            'message' => 'Chức năng export phản biện chưa được hỗ trợ.'
        ], 501);
    });
    Route::any('/exports/tongket', function () {
        return response()->json([
            'message' => 'Chức năng export tổng kết chưa được hỗ trợ.'
        ], 501);
    });
    Route::any('/exports/word/assignment', function () {
        return response()->json([
            'message' => 'Chức năng export Word assignment chưa được hỗ trợ.'
        ], 501);
    });
    Route::any('/exports/word/gvhd/{topic}', function () {
        return response()->json([
            'message' => 'Chức năng export Word GVHD chưa được hỗ trợ.'
        ], 501);
    });
    Route::any('/exports/word/gvpb/{topic}', function () {
        return response()->json([
            'message' => 'Chức năng export Word GVPB chưa được hỗ trợ.'
        ], 501);
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
    Route::get('/thesis-form', [ThesisFormController::class, 'index']);
    Route::post('/thesis-form', [ThesisFormController::class, 'store']);
    Route::put('/thesis-form/{form}', [ThesisFormController::class, 'update']);
    Route::delete('/thesis-form/{form}', [ThesisFormController::class, 'destroy']);
    Route::delete('/thesis-forms', [ThesisFormController::class, 'destroyAll']);


    // Nếu chưa login mà cố gắng truy cập API, trả về lỗi 401 Unauthorized
    Route::middleware('auth.api')->any('/{any}', function () {
        return response()->json([
            'message' => 'Unauthorized. Vui lòng đăng nhập để truy cập API.',
        ], 401);
    })->where('any', '.*');
});

<?php


namespace App\Http\Controllers;

use App\Models\DeTai;
use App\Models\GiangVien;
use App\Models\SinhVien;
use App\Models\ThanhVienHoiDong;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
{
    $request->validate([
        'maGV' => 'required|string',
        'password' => 'required|string',
    ]);

    // 1. Tìm người dùng trong bảng giangvien
    $user = \App\Models\GiangVien::where('maGV', $request->maGV)->first();

    // 2. Xác thực (Sử dụng so sánh trực tiếp theo dữ liệu hiện tại của bạn)
    if (!$user || !($request->password === $user->matKhau)) {
        return response()->json(['message' => 'Mã số hoặc mật khẩu không đúng'], 401);
    }

    // 3. Tạo Token xác thực 
    $token = $user->createToken('auth_token')->plainTextToken;

    // 4. Phân loại Role dựa trên mã hiệu (TK = Thư ký, còn lại = Giảng viên)
    $role = str_starts_with(strtoupper($user->maGV), 'TK') ? 'thuky' : 'gv';

    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->maGV,
            'name' => $user->tenGV,
            'email' => $user->email,
            'type' => 'giangvien', // Vẫn thuộc bảng giangvien để tạo token
            'role' => $role,       // Trả về 'thuky' hoặc 'gv'
        ],
    ]);
}

    // Đăng nhập cho sinh viên
    public function loginSinhVien(Request $request)
    {
        $request->validate([
            'mssv' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = SinhVien::where('mssv', $request->mssv)->first();

        if (!$user || !($request->password === $user->matKhau)) {
            return response()->json(['message' => 'MSSV hoặc mật khẩu không đúng'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->mssv,
                'name' => $user->hoTen,
                'email' => $user->email,
                'class' => $user->lop,
                'type' => 'sinhvien',
                'role' => 'sinhvien',
            ],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        // Nếu là sinh viên
        if ($user instanceof \App\Models\SinhVien) {
            return response()->json([
                'id' => $user->mssv,
                'name' => $user->hoTen,
                'email' => $user->email,
                'class' => $user->lop,
                'type' => 'sinhvien',
                'role' => 'sinhvien',
            ]);
        }


        $role = null;
        if ($user->isAdmin ?? false) {
            $role = 'thuky';
        } else {
            $tvhd = ThanhVienHoiDong::where('maGV', $user->maGV)->first();
            if ($tvhd) {
                $role = $tvhd->vaiTro;
            } elseif (DeTai::where('maGV_HD', $user->maGV)->exists()) {
                $role = 'gvhd';
            } elseif (DeTai::where('maGV_PB', $user->maGV)->exists()) {
                $role = 'gvpb';
            } else {
                $role = 'gv';
            }
        }

        return response()->json([
            'id' => $user->maGV,
            'name' => $user->tenGV,
            'email' => $user->email,
            'type' => 'giangvien',
            'role' => $role,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Dang xuat thanh cong']);
    }
}

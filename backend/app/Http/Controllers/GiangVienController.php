<?php

namespace App\Http\Controllers;

use App\Models\DeTai;
use App\Models\GiangVien;
use App\Models\SinhVien;
use App\Models\ThanhVienHoiDong;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
class GiangVienController extends Controller
{
    public function index()
    {
        $list = GiangVien::where('maGV', 'NOT LIKE', 'TK%')->get();
        foreach ($list as $gv) {
            $gv->so_sv_hd = \App\Models\SinhVien::whereHas('deTai', function ($q) use ($gv) {
                $q->where('maGV_HD', $gv->maGV);
            })->count();
            $gv->so_dt_pb = \App\Models\DeTai::where('maGV_PB', $gv->maGV)->count();
            $gv->so_hd = \App\Models\ThanhVienHoiDong::where('maGV', $gv->maGV)->count();
        }
        return response()->json(['data' => $list]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'maGV' => 'required|unique:giangvien,maGV',
            'tenGV' => 'required',
            'email' => 'required|email|unique:giangvien,email',
            'password' => 'required|min:1',
            'hocVi' => 'nullable|in:ThS,TS,PGS.TS,GS.TS',
            'soDienThoai' => 'nullable',
        ]);
        try {
        DB::beginTransaction();
        $gv = GiangVien::create([
            'maGV' => $request->maGV,
            'tenGV' => $request->tenGV,
            'email' => $request->email,
            'soDienThoai' => $request->soDienThoai,
            'hocVi' => $request->hocVi,
            'matKhau' => Hash::make($request->password),
        ]);
        DB::table('user_role')->insert([
        'username' => $request->maGV,
        'password' => $request->password,
        'role_name' => 'giangvien',
        'created_at' => now(),
    ]);
    DB::commit();
    return response()->json([
            'message' => 'Thêm giảng viên thành công',
            'data' => $gv
        ], 201);
        } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Lỗi khi thêm giảng viên: ' . $e->getMessage()
        ], 500);
    }
    }

    public function update(Request $request, $maGV)
    {
        $gv = GiangVien::where('maGV', $maGV)->first();
        if (!$gv) {
            return response()->json(['message' => 'Khong tim thay giang vien'], 404);
        }

        $request->validate([
            'tenGV' => 'required',
            'email' => 'required|email|unique:giangvien,email,' . $maGV . ',maGV',
            'password' => 'nullable|min:1',
            'hocVi' => 'nullable|in:ThS,TS,PGS.TS,GS.TS',
            'soDienThoai' => 'nullable',
        ]);
        $data = [
            'tenGV' => $request->tenGV,
            'email' => $request->email,
            'hocVi' => $request->hocVi,
            'soDienThoai' => $request->soDienThoai,
        ];
        if ($request->filled('password')) {
            $data['matKhau'] = Hash::make($request->password);
        }
        $gv->update($data);

        return response()->json(['data' => $gv]);
    }

    public function destroy($maGV)
    {
        $gv = GiangVien::where('maGV', $maGV)->first();
        if (!$gv) {
            return response()->json(['message' => 'Khong tim thay giang vien'], 404);
        }

        if (\App\Models\DeTai::where('maGV_HD', $maGV)->exists()) {
            return response()->json(['message' => 'Khong the xoa giang vien dang huong dan sinh vien'], 422);
        }

        $gv->delete();
        return response()->json(['message' => 'ok']);
    }
}

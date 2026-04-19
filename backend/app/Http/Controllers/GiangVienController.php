<?php

namespace App\Http\Controllers;

use App\Models\DeTai;
use App\Models\GiangVien;
use App\Models\SinhVien;
use App\Models\ThanhVienHoiDong;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class GiangVienController extends Controller
{
    public function index()
    {
        $list = GiangVien::all();
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
        $gv = GiangVien::create([
            'maGV' => $request->maGV,
            'tenGV' => $request->tenGV,
            'email' => $request->email,
            'soDienThoai' => $request->soDienThoai,
            'hocVi' => $request->hocVi,
            'matKhau' => Hash::make($request->password),
        ]);

        return response()->json(['data' => $gv], 201);
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

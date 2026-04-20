<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ThanhVienHoiDong;
use App\Models\HoiDong;
use App\Models\GiangVien;

class ThanhVienHoiDongController extends Controller
{
    // API phân công giảng viên vào hội đồng
    public function phanCongGiangVien(Request $request)
    {
        $request->validate([
            'maHoiDong' => 'required|exists:hoidong,maHoiDong',
            'maGV' => 'required|exists:giangvien,maGV',
            'vaiTro' => 'nullable|string',
        ]);

        $maHoiDong = $request->maHoiDong;
        $maGV = $request->maGV;
        $vaiTro = $request->vaiTro;

        $soLuong = ThanhVienHoiDong::where('maHoiDong', $maHoiDong)->count();
        if ($soLuong >= 4) {
            return response()->json(['message' => 'Hội đồng đã đủ 4 giảng viên!'], 400);
        }

      
        $exists = ThanhVienHoiDong::where('maHoiDong', $maHoiDong)->where('maGV', $maGV)->exists();
        if ($exists) {
            return response()->json(['message' => 'Giảng viên đã có trong hội đồng này!'], 400);
        }

        $thanhVien = ThanhVienHoiDong::create([
            'maHoiDong' => $maHoiDong,
            'maGV' => $maGV,
            'vaiTro' => $vaiTro,
        ]);

        return response()->json(['message' => 'Phân công thành công!', 'data' => $thanhVien]);
    }

    public function index($maHoiDong)
    {
        $thanhVien = ThanhVienHoiDong::with('giangVien')
            ->where('maHoiDong', $maHoiDong)
            ->get();

        return response()->json($thanhVien);
    }

    public function destroy($id)
    {
        $thanhVien = ThanhVienHoiDong::find($id);
        if (!$thanhVien) {
            return response()->json(['message' => 'Không tìm thấy thành viên hội đồng'], 404);
        }

        $thanhVien->delete();
        return response()->json(['message' => 'Xóa thành viên hội đồng thành công']);
    }

    public function update(Request $request, $id)
    {
        $thanhVien = ThanhVienHoiDong::find($id);
        if (!$thanhVien) {
            return response()->json(['message' => 'Không tìm thấy thành viên hội đồng'], 404);
        }

        $request->validate([
            'vaiTro' => 'nullable|string',
        ]);

        $thanhVien->vaiTro = $request->vaiTro;
        $thanhVien->save();

        return response()->json(['message' => 'Cập nhật thành viên hội đồng thành công', 'data' => $thanhVien]);
    }

    public function getDanhSachGiangVienChuaCoTrongHoiDong($maHoiDong)
    {
        $giangVienTrongHoiDong = ThanhVienHoiDong::where('maHoiDong', $maHoiDong)->pluck('maGV');
        $giangVienChuaCoTrongHoiDong = GiangVien::whereNotIn('maGV', $giangVienTrongHoiDong)->get();

        return response()->json($giangVienChuaCoTrongHoiDong);
    }


    public function getDanhSachHoiDong()
    {
        $hoiDongs = HoiDong::all();
        return response()->json($hoiDongs);
    }

    
}

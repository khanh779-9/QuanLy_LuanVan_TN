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
        // 3. RÀNG BUỘC VAI TRÒ (1 CT, 1 TK, 2 UV)
        $countVaiTro = ThanhVienHoiDong::where('maHoiDong', $maHoiDong)->where('vaiTro', $vaiTro)->count();
        if ($vaiTro === 'ChuTich' && $countVaiTro >= 1) {
            return response()->json(['message' => 'Hội đồng này đã có Chủ tịch!'], 400);
        }
        if ($vaiTro === 'ThuKy' && $countVaiTro >= 1) {
            return response()->json(['message' => 'Hội đồng này đã có Thư ký!'], 400);
        }
        if ($vaiTro === 'UyVien' && $countVaiTro >= 2) {
            return response()->json(['message' => 'Hội đồng này đã đủ 2 Ủy viên!'], 400);
        }

        // 4. KIỂM TRA TRÙNG LỊCH (TRÙNG NGÀY GIỜ BẢO VỆ)
        $targetHoiDong = HoiDong::find($maHoiDong);
        if ($targetHoiDong && $targetHoiDong->ngayBaoVe) {
            $isOverlapping = HoiDong::whereHas('thanhVien', function ($q) use ($maGV) {
                $q->where('maGV', $maGV);
            })
            ->where('maHoiDong', '!=', $maHoiDong)
            ->where('ngayBaoVe', $targetHoiDong->ngayBaoVe) // Check trùng khớp thời gian
            ->exists();

            if ($isOverlapping) {
                return response()->json(['message' => "Giảng viên này bị trùng lịch với hội đồng khác vào lúc {$targetHoiDong->ngayBaoVe}!"], 400);
            }
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
        $giangVienChuaCoTrongHoiDong = GiangVien::whereNotIn('maGV', $giangVienTrongHoiDong)->where('maGV', 'not like', 'TK%')->get();

        return response()->json($giangVienChuaCoTrongHoiDong);
    }


    public function getDanhSachHoiDong()
    {
        $hoiDongs = HoiDong::all();
        return response()->json($hoiDongs);
    }

    
}

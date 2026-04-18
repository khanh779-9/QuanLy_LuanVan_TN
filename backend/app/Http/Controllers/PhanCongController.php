<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DeTai;

class PhanCongController extends Controller
{
   
    public function index(Request $request)
    {
        $pageSize = $request->input('per_page', 15);
        $query = DeTai::with(['sinhVien', 'giangVienHD', 'giangVienPB']);
 
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function($subq) use ($q) {
                $subq->where('tenDeTai', 'like', "%{$q}%")
                     ->orWhereHas('giangVienHD', function($qGV) use ($q) {
                         $qGV->where('tenGV', 'like', "%{$q}%");
                     })
                     ->orWhereHas('giangVienPB', function($qGV) use ($q) {
                         $qGV->where('tenGV', 'like', "%{$q}%");
                     })
                     ->orWhereHas('sinhVien', function($qSV) use ($q) {
                         $qSV->where('hoTen', 'like', "%{$q}%")
                              ->orWhere('mssv', 'like', "%{$q}%");
                     });
            });
        }

        $detais = $query->orderByDesc('maDeTai')->paginate($pageSize);
        return response()->json($detais);
    }
    public function getDanhSachChuaCoGVHD()
    {
        return DeTai::with('sinhVien')
            ->whereNull('maGV_HD')
            ->get();
    }

    public function phancongGVHD(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'maGV_HD' => 'required|exists:giangvien,maGV'
        ]);

        // Cập nhật maGV_HD cho danh sách maDeTai gửi lên
        DeTai::whereIn('maDeTai', $request->ids)
            ->update(['maGV_HD' => $request->maGV_HD]);

        return response()->json(['message' => 'Phân công thành công!']);
    }
    
    public function update(Request $request, $id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Không tìm thấy đề tài'], 404);

        $data = $request->only(['maGV_HD', 'maGV_PB']);
        if (array_key_exists('maGV_HD', $data)) $detai->maGV_HD = $data['maGV_HD'];
        if (array_key_exists('maGV_PB', $data)) $data['maGV_PB'] ? ($detai->maGV_PB = $data['maGV_PB']) : ($detai->maGV_PB = null);
        // Lưu ý: Nếu gửi null thì sẽ update null. Để an toàn, hỗ trợ ép kiểu logic trống.
        if (array_key_exists('maGV_PB', $data)) $detai->maGV_PB = $data['maGV_PB'] ?: null;
        if (array_key_exists('maGV_HD', $data)) $detai->maGV_HD = $data['maGV_HD'] ?: null;

        $detai->save();

        return response()->json(['message' => 'Cập nhật phân công thành công', 'data' => $detai]);
    }

  
    public function destroy($id)
    {
        $detai = DeTai::find($id);
        if ($detai) {
            $detai->maGV_HD = null;
            $detai->maGV_PB = null;
            $detai->save();
        }
        return response()->json(['message' => 'Đã xóa phân công']);
    }
}

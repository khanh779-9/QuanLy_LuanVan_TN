<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DeTai;
use App\Models\SinhVien;
use App\Models\GiangVien;
use PhpOffice\PhpWord\TemplateProcessor;
use PhpOffice\PhpWord\Settings;

class DeTaiController extends Controller
{

    public function index(Request $request)
    {
        $query = DeTai::query();
        // Lọc theo mã GV hướng dẫn
        if ($request->filled('maGV_HD')) {
            $query->where('maGV_HD', $request->maGV_HD);
        }
        if ($request->filled('maGV_PB')) {
            $query->where('maGV_PB', $request->maGV_PB);
        }
        if ($request->filled('maHoiDong')) {
            $query->where('maHoiDong', $request->maHoiDong);
        }
        if ($request->filled('trangThai')) {
            $query->where('trangThai', $request->trangThai);
        }
        if ($request->filled('q')) {
            $query->where('tenDeTai', 'like', '%' . $request->q . '%');
        }
        $query->orderByDesc('maDeTai');
        $pageSize = $request->input('per_page', 15);



        $result = $query->paginate($pageSize);

        // Lấy danh sách mã đề tài trên trang này
        $maDeTaiArr = collect($result->items())->pluck('maDeTai')->all();
        $sinhVienMap = [];
        if (!empty($maDeTaiArr)) {
            $sinhViens = \App\Models\SinhVien::whereIn('maDeTai', $maDeTaiArr)->get();
            foreach ($sinhViens as $sv) {
                $sinhVienMap[$sv->maDeTai][] = [
                    'mssv' => $sv->mssv,
                    'hoTen' => $sv->hoTen,
                    'lop' => $sv->lop,
                    'email' => $sv->email,
                    'soDienThoai' => $sv->soDienThoai,
                ];
            }
        }
        $result->getCollection()->transform(function ($deTai) use ($sinhVienMap) {
            $deTai->sinh_viens = $sinhVienMap[$deTai->maDeTai] ?? [];
            return $deTai;
        });
        return response()->json($result);
    }


    public function show($id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);
        return response()->json($detai);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenDeTai' => 'required|string|max:255',
            'moTa' => 'nullable|string',
            'maGV_HD' => 'required|string|max:20',
            'maGV_PB' => 'nullable|string|max:20',
            'maHoiDong' => 'nullable|integer',
            'trangThai' => 'nullable|string|max:50',
            'data_json' => 'nullable|array',
        ]);
        $detai = DeTai::create($validated);
        return response()->json($detai, 201);
    }

    public function update(Request $request, $id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);
        $validated = $request->validate([
            'tenDeTai' => 'sometimes|required|string|max:255',
            'moTa' => 'nullable|string',
            'maGV_HD' => 'sometimes|required|string|max:20',
            'maGV_PB' => 'nullable|string|max:20',
            'maHoiDong' => 'nullable|integer',
            'trangThai' => 'nullable|string|max:50',
            'diemGiuaKy' => 'nullable|numeric',
            'nhanXetGiuaKy' => 'nullable|string',
            'trangThaiGiuaKy' => 'nullable|string',
            'data_json' => 'nullable|array',
        ]);
        $detai->update($validated);
        return response()->json($detai);
    }

    public function chamDiemHD(Request $request, $id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        // Chỉ kiểm tra theo mã giảng viên hướng dẫn
        if ($detai->maGV_HD !== $user->maGV) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Cho phép cập nhật data_json khi chấm điểm
        $validated = $request->validate([
            'diemHuongDan' => 'nullable|numeric|min:0|max:10',
            'nhanXetHuongDan' => 'nullable|string',
            'uuDiem' => 'nullable|string',
            'thieuSot' => 'nullable|string',
            'ndDieuChinh' => 'nullable|string',
            'cauHoi' => 'nullable|string',
            'thuyetMinh' => 'nullable|string',
            'diemPhanTich' => 'nullable|array',
            'diemThietKe' => 'nullable|array',
            'diemHienThuc' => 'nullable|array',
            'diemBaoCao' => 'nullable|array',
            'diemTongCong' => 'nullable|array',
            'diemFinal' => 'nullable|array',
            'deNghi' => 'nullable|array',
            'data_json' => 'nullable|array',
        ]);
        $detai->update($validated);
        return response()->json($detai);
    }

    public function chamDiemPB(Request $request, $id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        // Chỉ kiểm tra theo mã giảng viên phản biện
        if ($detai->maGV_PB !== $user->maGV) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Cho phép cập nhật data_json khi chấm điểm
        $validated = $request->validate([
            'diemHuongDan' => 'nullable|numeric|min:0|max:10',
            'nhanXetHuongDan' => 'nullable|string',
            'uuDiem' => 'nullable|string',
            'thieuSot' => 'nullable|string',
            'ndDieuChinh' => 'nullable|string',
            'cauHoi' => 'nullable|string',
            'thuyetMinh' => 'nullable|string',
            'diemPhanTich' => 'nullable|array',
            'diemThietKe' => 'nullable|array',
            'diemHienThuc' => 'nullable|array',
            'diemBaoCao' => 'nullable|array',
            'diemTongCong' => 'nullable|array',
            'diemFinal' => 'nullable|array',
            'deNghi' => 'nullable|array',
            'data_json' => 'nullable|array',
        ]);
        $detai->update($validated);
        return response()->json($detai);
    }

    public function chamDiemGK(Request $request, $id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        // Chỉ kiểm tra theo mã giảng viên hướng dẫn
        if ($detai->maGV_HD !== $user->maGV) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'tieu_chi' => 'required|array',
            'tieu_chi.*' => 'numeric|min:0|max:10',
            'tong_diem' => 'required|numeric|min:0|max:10',
            'nhan_xet' => 'nullable|string',
            'trang_thai' => 'nullable|string',
        ]);

        $trangThai = $request->trang_thai;
        if (!$trangThai) {
            $trangThai = $request->tong_diem >= 5 ? 'dat' : 'khong_dat';
        }

        $detai->diemGiuaKy = $request->tong_diem;
        $detai->nhanXetGiuaKy = $request->nhan_xet;
        $detai->trangThaiGiuaKy = $trangThai;
        $detai->save();

        return response()->json($detai);
    }

    // Xoá đề tài
    public function destroy($id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);
        $detai->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function exportGVHD($id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);

        $dataGVHD = $detai->data_json['gvhd'] ?? [];
        $gvhd = GiangVien::find($detai->maGV_HD);
        $templateDir = base_path('/template_docs');
        $svArr = $dataGVHD['sinh_viens'] ?? [];
        if (count($svArr) < 1) {
            // fallback lấy từ bảng sinh viên nếu chưa có trong data_json
            $svArr = SinhVien::where('maDeTai', $id)->get()->toArray();
        }
        $templateFile = count($svArr) >= 2
            ? $templateDir . '/template_chamdiem_hd_2sv.docx'
            : $templateDir . '/template_chamdiem_hd_1sv.docx';
        if (!file_exists($templateFile)) {
            return response()->json(['message' => 'Template không tồn tại, chạy scripts/prepare_templates.php trước'], 500);
        }
        Settings::setTempDir(storage_path('app'));
        $tp = new TemplateProcessor($templateFile);
        // Gán biến chung
        $tp->setValue('tenDeTai', $detai->tenDeTai ?? '');
        $tp->setValue('tenGVHD', $gvhd ? $gvhd->tenGV : '');
        $tp->setValue('ndDieuChinh', $dataGVHD['ndDieuChinh'] ?? '');
        $tp->setValue('uuDiem', $dataGVHD['uuDiem'] ?? '');
        $tp->setValue('thieuSot', $dataGVHD['thieuSot'] ?? '');
        $tp->setValue('cauHoi', $dataGVHD['cauHoi'] ?? '');
        // Thuyết minh
        $thuyetMinh = $dataGVHD['thuyetMinh'] ?? '';
        $tp->setValue('thuyetMinh_Dat', $thuyetMinh === 'Đạt' ? 'x' : '');
        $tp->setValue('thuyetMinh_KhongDat', $thuyetMinh === 'Không đạt' ? 'x' : '');
        // Đề nghị
        $deNghiArr = array_column($svArr, 'deNghi');
        $tp->setValue('deNghi_Duoc', in_array('Được bảo vệ', $deNghiArr) ? 'x' : '');
        $tp->setValue('deNghi_Khong', in_array('Không được bảo vệ', $deNghiArr) ? 'x' : '');
        $tp->setValue('deNghi_BoSung', in_array('Bổ sung', $deNghiArr) ? 'x' : '');
        // Sinh viên
        for ($i = 0; $i < 2; $i++) {
            $sv = $svArr[$i] ?? [];
            $idx = $i + 1;
            $tp->setValue('hoTenSV' . $idx, $sv['hoTen'] ?? '');
            $tp->setValue('mssv' . $idx, $sv['mssv'] ?? '');
            $tp->setValue('lop' . $idx, $sv['lop'] ?? '');
            $tp->setValue('diemPhanTich' . $idx, $sv['diemPhanTich'] ?? '');
            $tp->setValue('diemThietKe' . $idx, $sv['diemThietKe'] ?? '');
            $tp->setValue('diemHienThuc' . $idx, $sv['diemHienThuc'] ?? '');
            $tp->setValue('diemBaoCao' . $idx, $sv['diemBaoCao'] ?? '');
            $tp->setValue('diemTongCong' . $idx, $sv['diemTongCong'] ?? '');
            $tp->setValue('diemFinal' . $idx, $sv['diemFinal'] ?? '');
        }
        // Điểm tối đa các mục (nếu có, hoặc hardcode)
        $tp->setValue('maxPhanTich', '10');
        $tp->setValue('maxThietKe', '10');
        $tp->setValue('maxHienThuc', '10');
        $tp->setValue('maxBaoCao', '10');
        // Ngày tháng năm
        $now = now();
        $tp->setValue('ngay', $now->day);
        $tp->setValue('thang', $now->month);
        $tp->setValue('nam', $now->year);
        $tempFile = storage_path('app/temp_HD_' . $detai->maDeTai . '_' . time() . '.docx');
        $tp->saveAs($tempFile);
        $filename = 'Phieu_cham_HD_' . $detai->maDeTai . '.docx';
        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }

    public function exportGVPB($id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);

        $dataGVPB = $detai->data_json['gvpb'] ?? [];
        $gvpb = GiangVien::find($detai->maGV_PB);
        $templateDir = base_path('/template_docs');
        $svArr = $dataGVPB['sinh_viens'] ?? [];
        if (count($svArr) < 1) {
            $svArr = SinhVien::where('maDeTai', $id)->get()->toArray();
        }
        $templateFile = count($svArr) >= 2
            ? $templateDir . '/template_chamdiem_pb_2sv.docx'
            : $templateDir . '/template_chamdiem_pb_1sv.docx';
        if (!file_exists($templateFile)) {
            return response()->json(['message' => 'Template không tồn tại, chạy scripts/prepare_templates.php trước'], 500);
        }
        Settings::setTempDir(storage_path('app'));
        $tp = new TemplateProcessor($templateFile);
        // Gán biến chung
        $tp->setValue('tenDeTai', $detai->tenDeTai ?? '');
        $tp->setValue('tenGVPB', $gvpb ? $gvpb->tenGV : '');
        $tp->setValue('ndDieuChinh', $dataGVPB['ndDieuChinh'] ?? '');
        $tp->setValue('uuDiem', $dataGVPB['uuDiem'] ?? '');
        $tp->setValue('thieuSot', $dataGVPB['thieuSot'] ?? '');
        $tp->setValue('cauHoi', $dataGVPB['cauHoi'] ?? '');
        // Thuyết minh
        $thuyetMinh = $dataGVPB['thuyetMinh'] ?? '';
        $tp->setValue('thuyetMinh_Dat', $thuyetMinh === 'Đạt' ? 'x' : '');
        $tp->setValue('thuyetMinh_KhongDat', $thuyetMinh === 'Không đạt' ? 'x' : '');
        // Đề nghị
        $deNghiArr = array_column($svArr, 'deNghi');
        $tp->setValue('deNghi_Duoc', in_array('Được bảo vệ', $deNghiArr) ? 'x' : '');
        $tp->setValue('deNghi_Khong', in_array('Không được bảo vệ', $deNghiArr) ? 'x' : '');
        $tp->setValue('deNghi_BoSung', in_array('Bổ sung', $deNghiArr) ? 'x' : '');
        // Sinh viên
        for ($i = 0; $i < 2; $i++) {
            $sv = $svArr[$i] ?? [];
            $idx = $i + 1;
            $tp->setValue('hoTenSV' . $idx, $sv['hoTen'] ?? '');
            $tp->setValue('mssv' . $idx, $sv['mssv'] ?? '');
            $tp->setValue('lop' . $idx, $sv['lop'] ?? '');
            $tp->setValue('diemPhanTich' . $idx, $sv['diemPhanTich'] ?? '');
            $tp->setValue('diemThietKe' . $idx, $sv['diemThietKe'] ?? '');
            $tp->setValue('diemHienThuc' . $idx, $sv['diemHienThuc'] ?? '');
            $tp->setValue('diemBaoCao' . $idx, $sv['diemBaoCao'] ?? '');
            $tp->setValue('diemTongCong' . $idx, $sv['diemTongCong'] ?? '');
            $tp->setValue('diemFinal' . $idx, $sv['diemFinal'] ?? '');
        }
        // Điểm tối đa các mục (nếu có, hoặc hardcode)
        $tp->setValue('maxPhanTich', '10');
        $tp->setValue('maxThietKe', '10');
        $tp->setValue('maxHienThuc', '10');
        $tp->setValue('maxBaoCao', '10');
        // Ngày tháng năm
        $now = now();
        $tp->setValue('ngay', $now->day);
        $tp->setValue('thang', $now->month);
        $tp->setValue('nam', $now->year);
        $tempFile = storage_path('app/temp_PB_' . $detai->maDeTai . '_' . time() . '.docx');
        $tp->saveAs($tempFile);
        $filename = 'Phieu_cham_PB_' . $detai->maDeTai . '.docx';
        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }

    private function diemSangChu($diem)
    {
        $map = [
            0 => 'Không',
            1 => 'Một',
            2 => 'Hai',
            3 => 'Ba',
            4 => 'Bốn',
            5 => 'Năm',
            6 => 'Sáu',
            7 => 'Bảy',
            8 => 'Tám',
            9 => 'Chín',
            10 => 'Mười',
        ];
        $decMap = [
            1 => 'một',
            2 => 'hai',
            3 => 'ba',
            4 => 'bốn',
            5 => 'năm',
            6 => 'sáu',
            7 => 'bảy',
            8 => 'tám',
            9 => 'chín',
        ];
        $floor = (int) $diem;
        $decDigit = (int) round(($diem - $floor) * 10);
        if ($decDigit === 0) {
            return ($map[$floor] ?? $floor) . ' điểm';
        }
        return ($map[$floor] ?? $floor) . ' phẩy ' . ($decMap[$decDigit] ?? $decDigit) . ' điểm';
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DeTai;
use App\Models\SinhVien;
use App\Models\GiangVien;
use PhpOffice\PhpWord\TemplateProcessor;
use PhpOffice\PhpWord\Settings;
use Illuminate\Support\Facades\Schema;

class DeTaiController extends Controller
{

    public function index(Request $request)
{
    // SỬA TẠI ĐÂY: Nạp luôn quan hệ Giảng viên (HD/PB) và Hội đồng
    // Chú ý: Tên 'giangVienHD', 'giangVienPB', 'sinhVien' phải khớp với function trong Model DeTai
    $query = DeTai::with(['giangVienHD', 'giangVienPB', 'hoiDong', 'sinhVien']);

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
    $search = $request->q;
    $query->where(function($q) use ($search) {
        // 1. Tìm theo tên đề tài
        $q->where('tenDeTai', 'like', '%' . $search . '%')
          // 2. Tìm theo mã đề tài (nếu cần)
          ->orWhere('maDeTai', 'like', '%' . $search . '%')
          // 3. Tìm xuyên qua bảng sinh viên (mssv hoặc hoTen)
          ->orWhereHas('sinhVien', function($sq) use ($search) {
              $sq->where('mssv', 'like', '%' . $search . '%')
                 ->orWhere('hoTen', 'like', '%' . $search . '%');
          });
    });
}

    $query->orderByDesc('maDeTai');
    $pageSize = $request->input('per_page', 15);

    $result = $query->paginate($pageSize);

        $result->getCollection()->transform(function ($deTai) {
            $deTai->sinh_viens = collect($deTai->sinhVien ?? [])->map(function ($sv) {
                return [
                    'mssv' => $sv->mssv,
                'hoTen' => $sv->hoTen,
                'lop' => $sv->lop,
                'email' => $sv->email,
                'soDienThoai' => $sv->soDienThoai,
            ];
        })->values()->all();

        $gk = $deTai->data_json['gk'] ?? [];
        if ((!isset($deTai->diemGiuaKy) || $deTai->diemGiuaKy === null) && array_key_exists('tong_diem', $gk)) {
            $deTai->diemGiuaKy = $gk['tong_diem'];
        }
        if ((!isset($deTai->nhanXetGiuaKy) || $deTai->nhanXetGiuaKy === null) && array_key_exists('nhanXet', $gk)) {
            $deTai->nhanXetGiuaKy = $gk['nhanXet'];
        }
            if ((!isset($deTai->trangThaiGiuaKy) || $deTai->trangThaiGiuaKy === null) && isset($gk['tong_diem']) && is_numeric($gk['tong_diem'])) {
                $deTai->trangThaiGiuaKy = $gk['tong_diem'] >= 5 ? 'dat' : 'khong_dat';
            }

            $gvhd = $deTai->data_json['gvhd'] ?? [];
            if ((!isset($deTai->diemHuongDan) || $deTai->diemHuongDan === null) && array_key_exists('tong_diem', $gvhd)) {
                $deTai->diemHuongDan = $gvhd['tong_diem'];
            }
            if ((!isset($deTai->nhanXetHuongDan) || $deTai->nhanXetHuongDan === null) && array_key_exists('nhanXet', $gvhd)) {
                $deTai->nhanXetHuongDan = $gvhd['nhanXet'];
            }

            $gvpb = $deTai->data_json['gvpb'] ?? [];
            if ((!isset($deTai->diemPhanBien) || $deTai->diemPhanBien === null) && array_key_exists('tong_diem', $gvpb)) {
                $deTai->diemPhanBien = $gvpb['tong_diem'];
            }
            if ((!isset($deTai->nhanXetPhanBien) || $deTai->nhanXetPhanBien === null) && array_key_exists('nhanXet', $gvpb)) {
                $deTai->nhanXetPhanBien = $gvpb['nhanXet'];
            }

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

      /**
     * Lấy đề tài của sinh viên hiện tại (dựa vào auth)
     */
    public function my(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        // Tìm sinh viên theo user hiện tại
        $sv = \App\Models\SinhVien::find($user->mssv);
        if (!$sv) {
            return response()->json(['message' => 'Sinh viên không tồn tại'], 404);
        }
        if (!$sv->maDeTai) {
            return response()->json(null);
        }
        $deTai = \App\Models\DeTai::find($sv->maDeTai);
        if (!$deTai) {
            return response()->json(null);
        }
        return response()->json($deTai);
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

        $dataJson = $detai->data_json ?? [];
        if (isset($validated['data_json']['gvhd'])) {
            $dataJson['gvhd'] = $validated['data_json']['gvhd'];
        }

        if (Schema::hasColumn('detai', 'diemHuongDan') && array_key_exists('diemHuongDan', $validated)) {
            $detai->diemHuongDan = $validated['diemHuongDan'];
        }
        if (Schema::hasColumn('detai', 'nhanXetHuongDan') && array_key_exists('nhanXetHuongDan', $validated)) {
            $detai->nhanXetHuongDan = $validated['nhanXetHuongDan'];
        }
        if (Schema::hasColumn('detai', 'uuDiem') && array_key_exists('uuDiem', $validated)) {
            $detai->uuDiem = $validated['uuDiem'];
        }
        if (Schema::hasColumn('detai', 'thieuSot') && array_key_exists('thieuSot', $validated)) {
            $detai->thieuSot = $validated['thieuSot'];
        }
        if (Schema::hasColumn('detai', 'ndDieuChinh') && array_key_exists('ndDieuChinh', $validated)) {
            $detai->ndDieuChinh = $validated['ndDieuChinh'];
        }
        if (Schema::hasColumn('detai', 'cauHoi') && array_key_exists('cauHoi', $validated)) {
            $detai->cauHoi = $validated['cauHoi'];
        }
        if (Schema::hasColumn('detai', 'thuyetMinh') && array_key_exists('thuyetMinh', $validated)) {
            $detai->thuyetMinh = $validated['thuyetMinh'];
        }

        $detai->data_json = $dataJson;
        $detai->save();
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
            'diemPhanBien' => 'nullable|numeric|min:0|max:10',
            'nhanXetPhanBien' => 'nullable|string',
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

        $dataJson = $detai->data_json ?? [];
        if (isset($validated['data_json']['gvpb'])) {
            $dataJson['gvpb'] = $validated['data_json']['gvpb'];
        }

        if (Schema::hasColumn('detai', 'diemPhanBien') && array_key_exists('diemPhanBien', $validated)) {
            $detai->diemPhanBien = $validated['diemPhanBien'];
        }
        if (Schema::hasColumn('detai', 'nhanXetPhanBien') && array_key_exists('nhanXetPhanBien', $validated)) {
            $detai->nhanXetPhanBien = $validated['nhanXetPhanBien'];
        }
        if (Schema::hasColumn('detai', 'uuDiem') && array_key_exists('uuDiem', $validated)) {
            $detai->uuDiem = $validated['uuDiem'];
        }
        if (Schema::hasColumn('detai', 'thieuSot') && array_key_exists('thieuSot', $validated)) {
            $detai->thieuSot = $validated['thieuSot'];
        }
        if (Schema::hasColumn('detai', 'ndDieuChinh') && array_key_exists('ndDieuChinh', $validated)) {
            $detai->ndDieuChinh = $validated['ndDieuChinh'];
        }
        if (Schema::hasColumn('detai', 'cauHoi') && array_key_exists('cauHoi', $validated)) {
            $detai->cauHoi = $validated['cauHoi'];
        }
        if (Schema::hasColumn('detai', 'thuyetMinh') && array_key_exists('thuyetMinh', $validated)) {
            $detai->thuyetMinh = $validated['thuyetMinh'];
        }

        $detai->data_json = $dataJson;
        $detai->save();
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

        $validated = $request->validate([
            'tong_diem' => 'required|numeric|min:0|max:10',
            'nhan_xet' => 'nullable|string',
            'trang_thai' => 'nullable|string',
            'data_json' => 'nullable|array',
        ]);

        $trangThai = $validated['trang_thai'] ?? null;
        if (!$trangThai) {
            $trangThai = $validated['tong_diem'] >= 5 ? 'dat' : 'khong_dat';
        }

        $dataJson = $detai->data_json ?? [];
        $dataJson['gk'] = array_merge($dataJson['gk'] ?? [], $validated['data_json']['gk'] ?? [], [
            'tong_diem' => $validated['tong_diem'],
            'nhanXet' => $validated['nhan_xet'] ?? null,
        ]);

        if (Schema::hasColumn('detai', 'diemGiuaKy')) {
            $detai->diemGiuaKy = $validated['tong_diem'];
        }
        if (Schema::hasColumn('detai', 'nhanXetGiuaKy')) {
            $detai->nhanXetGiuaKy = $validated['nhan_xet'] ?? null;
        }
        $detai->data_json = $dataJson;
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

     /**
     * Xuất phiếu nhiệm vụ tốt nghiệp cho đề tài
     */
    public function exportNhiemVu($id)
    {
        $detai = DeTai::find($id);
        if (!$detai) return response()->json(['message' => 'Not found'], 404);

        // Lấy danh sách sinh viên (ưu tiên data_json nếu có, fallback bảng sinhvien)
        $dataNhiemVu = $detai->data_json['nhiemVu'] ?? [];
        $svArr = [];
        if (!empty($dataNhiemVu['sinhViens']) && is_array($dataNhiemVu['sinhViens'])) {
            $svArr = $dataNhiemVu['sinhViens'];
        } else {
            $svArr = SinhVien::where('maDeTai', $id)->get(['hoTen','mssv','lop'])->toArray();
        }
        // Đảm bảo luôn có 2 slot SV (SV2 có thể rỗng)
        if (count($svArr) < 2) {
            $svArr[1] = ["hoTen"=>"", "mssv"=>"", "lop"=>""];
        }

        // Lấy thông tin GVHD
        $gvhd = GiangVien::find($detai->maGV_HD);

        // Chuẩn bị dữ liệu cho template
        $templateDir = base_path('/template_docs');
        $templateFile = $templateDir . '/phieu_giao_de_tai.docx';
        if (!file_exists($templateFile)) {
            return response()->json(['message' => 'Template không tồn tại, hãy thêm file phieu_giao_de_tai.docx'], 500);
        }
        Settings::setTempDir(storage_path('app'));
        $tp = new TemplateProcessor($templateFile);
        // Thông tin sinh viên
        for ($i = 0; $i < 2; $i++) {
            $sv = $svArr[$i] ?? ["hoTen"=>"", "mssv"=>"", "lop"=>""];
            $idx = $i + 1;
            $tp->setValue('hoTenSV' . $idx, $sv['hoTen'] ?? '');
            $tp->setValue('mssv' . $idx, $sv['mssv'] ?? '');
            $tp->setValue('lop' . $idx, $sv['lop'] ?? '');
        }
        // Thông tin đề tài
        $tp->setValue('tieuDe', $dataNhiemVu['tieuDe'] ?? $detai->tenDeTai ?? '');
        $tp->setValue('nhiemVu', $dataNhiemVu['nhiemVu'] ?? '');
        $tp->setValue('taiLieu', $dataNhiemVu['taiLieu'] ?? '');
        // Thời gian
        $tp->setValue('ngayGiao', $dataNhiemVu['ngayGiao'] ?? '');
        $tp->setValue('ngayHoanThanh', $dataNhiemVu['ngayHoanThanh'] ?? '');
        // Giảng viên hướng dẫn (xuất hiện 2 lần trong template)
        $tenGVHD = $dataNhiemVu['tenGVHD'] ?? ($gvhd ? $gvhd->tenGV : '');
        $tp->setValue('tenGVHD', $tenGVHD);
        // Ngày ký (Tp.HCM, ngày ...)
        $now = now();
        $tp->setValue('ngayKy', $now->format('d/m/Y'));

        $tempFile = storage_path('app/temp_NHIEMVU_' . $detai->maDeTai . '_' . time() . '.docx');
        $tp->saveAs($tempFile);
        $filename = 'NhiemVu_TotNghiep_' . $detai->maDeTai . '.docx';
        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }
}

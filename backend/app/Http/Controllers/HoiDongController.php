<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HoiDong;
use App\Models\DeTai;

class HoiDongController extends Controller
{
    // 1. Lấy danh sách hội đồng
    public function index()
    {
        // Có thể lấy kèm số lượng đề tài và thành viên nếu cần
        $hoiDongs = HoiDong::all();
        return response()->json($hoiDongs);
    }

    // 2. Tạo hội đồng mới
    public function store(Request $request)
    {
        $request->validate([
            'tenHoiDong' => 'required|string|max:255',
            'diaDiem'    => 'nullable|string|max:255',
            'ngayBaoVe'  => 'nullable|date',
        ]);

        $hoiDong = HoiDong::create($request->all());
        return response()->json(['message' => 'Tạo hội đồng thành công', 'data' => $hoiDong], 201);
    }

    // 3. Cập nhật thông tin hội đồng
    public function update(Request $request, $id)
    {
        $hoiDong = HoiDong::find($id);
        if (!$hoiDong) return response()->json(['message' => 'Not found'], 404);

        $hoiDong->update($request->only(['tenHoiDong', 'diaDiem', 'ngayBaoVe']));
        return response()->json(['message' => 'Cập nhật thành công', 'data' => $hoiDong]);
    }

    // 4. Xóa hội đồng
    public function destroy($id)
    {
        HoiDong::destroy($id);
        // Các foreign key SET NULL hoặc CASCADE sẽ tự động chạy
        return response()->json(['message' => 'Xóa hội đồng thành công']);
    }

    // 1. Hàm gán đề tài: Tự động lấy STT cuối cùng
    public function ganDeTai(Request $request, $maHoiDong)
    {
        $request->validate([
        'maDeTai' => 'required|exists:detai,maDeTai',
    ]);

    $deTai = DeTai::find($request->maDeTai);

    // KIỂM TRA TRẠNG THÁI:
    // Nếu đề tài bị đình chỉ hoặc không đạt thì không cho phép gán vào hội đồng
    $invalidStatuses = ['dinh_chi', 'khong_dat'];
    if (in_array($deTai->trangThai, $invalidStatuses)) {
        return response()->json([
            'message' => 'Đề tài này đã bị đình chỉ hoặc không đạt, không thể phân công vào hội đồng bảo vệ!'
        ], 422);
    }

    // Lấy STT lớn nhất hiện tại của hội đồng đó
    $maxOrder = DeTai::where('maHoiDong', $maHoiDong)->max('thuTuTrongHD') ?? 0;

    $deTai->maHoiDong = $maHoiDong;
    $deTai->thuTuTrongHD = $maxOrder + 1; 
    $deTai->save();

    return response()->json(['message' => 'Đã gán đề tài vào hội đồng thành công']);
    }

    // 2. Hàm gỡ đề tài: Phải đánh số lại cho các đề tài còn lại
    public function goDeTai($maDeTai)
    {
        $deTai = DeTai::find($maDeTai);
        if ($deTai) {
            $maHD_Cu = $deTai->maHoiDong; // Lưu lại mã hội đồng vừa gỡ

            $deTai->maHoiDong = null;
            $deTai->thuTuTrongHD = null;
            $deTai->save();

            // ĐÁNH SỐ LẠI TOÀN BỘ HỘI ĐỒNG ĐÓ
            if ($maHD_Cu) {
                $danhSachConLai = DeTai::where('maHoiDong', $maHD_Cu)
                    ->orderBy('thuTuTrongHD', 'asc')
                    ->get();

                foreach ($danhSachConLai as $index => $dt) {
                    $dt->thuTuTrongHD = $index + 1; // Reset lại 1, 2, 3...
                    $dt->save();
                }
            }
        }
        return response()->json(['message' => 'Đã gỡ và cập nhật lại STT']);
    }
    // backend/app/Http/Controllers/HoiDongController.php

public function exportKhongDuocBaoVe()
{
    // Lấy đề tài bị loại dựa trên trangThai hoặc trangThaiGiuaKy
    $detais = \App\Models\DeTai::with(['sinhVien', 'giangVienHD'])
        ->where('trangThai', 'khong_dat')
        ->orWhere('trangThaiGiuaKy', 'dinh_chi')
        ->get();

    $templateFile = base_path('template_docs' . DIRECTORY_SEPARATOR . 'template_dssv_khongduocbaovelvtn.docx');
    if (!file_exists($templateFile)) {
        return response()->json(['message' => 'Thiếu file template_dssv_khongduocbaovelvtn.docx'], 500);
    }

    $tp = new \PhpOffice\PhpWord\TemplateProcessor($templateFile);
    
    // Đếm tổng số sinh viên bị loại để clone dòng
    $totalSV = 0;
    foreach($detais as $dt) $totalSV += $dt->sinhVien->count();
    
    $tp->cloneRow('stt', $totalSV);

    $rowIndex = 1;
    foreach ($detais as $dt) {
        foreach ($dt->sinhVien as $sv) {
            $tp->setValue('stt#' . $rowIndex, $rowIndex);
            $tp->setValue('mssv#' . $rowIndex, $sv->mssv);
            $tp->setValue('tensv#' . $rowIndex, $sv->hoTen);
            $tp->setValue('tendetai#' . $rowIndex, $dt->tenDeTai ?? $dt->moTa);
            $tp->setValue('gvhd#' . $rowIndex, $dt->giangVienHD->tenGV ?? '—');
            $rowIndex++;
        }
    }

    $fileName = "DS_SinhVien_Khong_Duoc_Bao_Ve.docx";
    $tempPath = public_path('exports' . DIRECTORY_SEPARATOR . $fileName);
    $tp->saveAs($tempPath);
    return response()->download($tempPath)->deleteFileAfterSend(true);
}
    public function exportTatCaHoiDong(Request $request)
    {
        // Mẹo kẹp token từ URL cho trình duyệt
        if (!$request->bearerToken() && $request->has('token')) {
            $request->headers->set('Authorization', 'Bearer ' . $request->token);
        }

        // Lấy tất cả hội đồng kèm đầy đủ quan hệ
        $hoiDongs = HoiDong::with(['thanhVien.giangVien', 'deTai.sinhVien', 'deTai.giangVienHD'])->get();

        $templateFile = base_path('template_docs' . DIRECTORY_SEPARATOR . 'template_danhsach_baove_LVTN.docx');
        if (!file_exists($templateFile)) {
            return response()->json(['message' => 'Thiếu file template mẫu'], 500);
        }

        $tp = new \PhpOffice\PhpWord\TemplateProcessor($templateFile);

        // Phần này dùng cloneBlock để lặp lại nguyên một khối (Hội đồng + Bảng đề tài)
        $tp->cloneBlock('block_hoidong', count($hoiDongs), true, true);

        foreach ($hoiDongs as $index => $hd) {
            $i = $index + 1;
            $tp->setValue('maHD#' . $i, $hd->maHoiDong);
            $tp->setValue('tenHD#' . $i, $hd->tenHoiDong);
            $tp->setValue('phong#' . $i, $hd->diaDiem ?? '...');
            $tp->setValue('ngay#' . $i, $hd->ngayBaoVe ? \Carbon\Carbon::parse($hd->ngayBaoVe)->format('d/m/Y H:i') : '...');

            // Thành viên
            $tv = $hd->thanhVien;
            $tp->setValue('chuTich#' . $i, $tv->where('vaiTro', 'ChuTich')->first()?->giangVien?->tenGV ?? '...');
            $tp->setValue('thuKy#' . $i, $tv->where('vaiTro', 'ThuKy')->first()?->giangVien?->tenGV ?? '...');
            $uyViens = $tv->where('vaiTro', 'UyVien')->values();
            $tp->setValue('uyVien1#' . $i, isset($uyViens[0]) ? $uyViens[0]->giangVien->tenGV : '...');
            $tp->setValue('uyVien2#' . $i, isset($uyViens[1]) ? $uyViens[1]->giangVien->tenGV : '...');
            // Đề tài (Lặp dòng trong bảng của hội đồng đó)
            $detais = $hd->deTai->sortBy('thuTuTrongHD');
            $tp->cloneRow('stt#' . $i, count($detais));
            foreach ($detais as $dIdx => $dt) {
    // 2. Lấy số thứ tự thực tế từ DB
    $sttDB = $dt->thuTuTrongHD; 

    // 3. Gán giá trị: Dùng $sttDB làm index cuối cùng (#i#sttDB)
    // Cách này sẽ điền đề tài có thuTuTrongHD = 1 vào hàng 1, số 2 vào hàng 2...
    $tp->setValue('stt#' . $i . '#' . $sttDB, $sttDB);
    $tp->setValue('tenDT#' . $i . '#' . $sttDB, $dt->tenDeTai ?? $dt->moTa);

    $svs = $dt->sinhVien->values();
    $tp->setValue('sv1#' . $i . '#' . $sttDB, isset($svs[0]) ? $svs[0]->hoTen : '...');
    $tp->setValue('ms1#' . $i . '#' . $sttDB, isset($svs[0]) ? $svs[0]->mssv : '...');
    $tp->setValue('sv2#' . $i . '#' . $sttDB, isset($svs[1]) ? $svs[1]->hoTen : '—');
    $tp->setValue('ms2#' . $i . '#' . $sttDB, isset($svs[1]) ? $svs[1]->mssv : '—');

    $tp->setValue('gvhd#' . $i . '#' . $sttDB, $dt->giangVienHD ? $dt->giangVienHD->tenGV : '...');
}
        }

        $fileName = "Danh_sach_bao_ve_LVTN.docx";
        $tempPath = public_path('exports' . DIRECTORY_SEPARATOR . $fileName);
        if (!file_exists(public_path('exports'))) {
            mkdir(public_path('exports'), 0777, true);
        }
        $tp->saveAs($tempPath);

        return response()->download($tempPath)->deleteFileAfterSend(true);
    }
    // 7. API Xuất danh sách bảo vệ
    public function exportDanhSach($maHoiDong)
    {
        $hoiDong = HoiDong::with(['deTai.sinhVien', 'thanhVien.giangVien'])->find($maHoiDong);

        // 1. Tạo file Word từ Template (giống cách bạn làm ở DeTaiController)
        $templateFile = base_path('template_docs' . DIRECTORY_SEPARATOR . 'template_danhsach_baove_LVTN.docx');

        $tp = new \PhpOffice\PhpWord\TemplateProcessor($templateFile);

        // Điền thông tin chung
        $tp->setValue('tenHoiDong', $hoiDong->tenHoiDong);
        $tp->setValue('diaDiem', $hoiDong->diaDiem);
        $tp->setValue('ngayBaoVe', $hoiDong->ngayBaoVe);

        // Điền bảng danh sách đề tài (Sử dụng cloneRow để lặp)
        $detais = $hoiDong->deTai->sortBy('thuTuTrongHD');
        $tp->cloneRow('stt', $detais->count());

        $i = 1;
        foreach ($detais as $dt) {
            $tp->setValue('stt#' . $i, $dt->thuTuTrongHD);
            $tp->setValue('tenDeTai#' . $i, $dt->tenDeTai);
            $tp->setValue('mssv#' . $i, $dt->sinhVien->pluck('mssv')->join(', '));
            $tp->setValue('hoTen#' . $i, $dt->sinhVien->pluck('hoTen')->join(', '));
            // ... các trường khác
            $i++;
        }

        // 2. QUAN TRỌNG: Để không bị hiện JSON, phải dùng stream response
        $fileName = "Danh_sach_Hoi_dong_" . $maHoiDong . ".docx";
        $tempPath = storage_path('app/public/' . $fileName);
        $tp->saveAs($tempPath);

        return response()->download($tempPath)->deleteFileAfterSend(true);
    }
}

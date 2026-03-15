<?php

namespace App\Http\Controllers;

use App\Models\Council;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LegacyIOController extends Controller
{
    private function ensureOfficeLibraries(): void
    {
        if (!class_exists('PhpOffice\\PhpSpreadsheet\\IOFactory') || !class_exists('PhpOffice\\PhpWord\\TemplateProcessor')) {
            $externalAutoload = base_path('../quanly_lvtn/vendor/autoload.php');
            if (file_exists($externalAutoload)) {
                require_once $externalAutoload;
            }
        }

        if (!class_exists('PhpOffice\\PhpSpreadsheet\\IOFactory') || !class_exists('PhpOffice\\PhpWord\\TemplateProcessor')) {
            abort(500, 'Thiếu thư viện Office. Hãy bật ext-zip và chạy composer require phpoffice/phpspreadsheet phpoffice/phpword');
        }
    }

    private function toWordMultiline(?string $text): string
    {
        return str_replace("\n", '<w:br/>', htmlspecialchars((string) ($text ?? '')));
    }

    public function importStudentsExcel(Request $request)
    {
        $this->ensureOfficeLibraries();

        $request->validate([
            'excel_file' => 'required|file|mimes:xlsx,xls',
        ]);

        $file = $request->file('excel_file')->getRealPath();
        $ioFactoryClass = 'PhpOffice\\PhpSpreadsheet\\IOFactory';
        $spreadsheet = $ioFactoryClass::load($file);
        $sheet = $spreadsheet->getActiveSheet();
        $highestRow = $sheet->getHighestDataRow();

        DB::transaction(function () use ($sheet, $highestRow) {
            for ($row = 2; $row <= $highestRow; $row++) {
                $mssv = trim((string) $sheet->getCell('B' . $row)->getValue());
                if ($mssv === '' || $mssv === 'MASV' || str_contains($mssv, 'Dữ liệu')) {
                    continue;
                }

                $ho = trim((string) $sheet->getCell('C' . $row)->getValue());
                $ten = trim((string) $sheet->getCell('D' . $row)->getValue());
                $hoTen = trim($ho . ' ' . $ten);
                $lop = trim((string) $sheet->getCell('E' . $row)->getValue());
                $maMH = trim((string) $sheet->getCell('F' . $row)->getValue());
                $tenDeTai = trim((string) $sheet->getCell('G' . $row)->getValue());
                $soDienThoai = trim((string) $sheet->getCell('H' . $row)->getValue());
                $email = trim((string) $sheet->getCell('I' . $row)->getValue());

                $maDeTai = null;
                if ($maMH !== '' && $tenDeTai !== '') {
                    $topic = Topic::where('maMH', $maMH)->where('tenDeTai', $tenDeTai)->first();
                    if ($topic) {
                        $maDeTai = $topic->maDeTai;
                    }
                }

                Student::updateOrCreate(
                    ['mssv' => $mssv],
                    [
                        'hoTen' => $hoTen,
                        'lop' => $lop !== '' ? $lop : null,
                        'soDienThoai' => $soDienThoai !== '' ? $soDienThoai : null,
                        'email' => $email !== '' ? $email : null,
                        'maDeTai' => $maDeTai,
                    ]
                );
            }
        });

        return response()->json([
            'message' => 'Import sinh viên thành công.',
        ]);
    }

    public function exportMidterm()
    {
        $this->ensureOfficeLibraries();

        $spreadsheetClass = 'PhpOffice\\PhpSpreadsheet\\Spreadsheet';
        $writerClass = 'PhpOffice\\PhpSpreadsheet\\Writer\\Xlsx';
        $spreadsheet = new $spreadsheetClass();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray(['STT', 'MSSV', 'Họ tên', 'Lớp', 'Tên đề tài', 'GVHD', 'Điểm GK', 'Trạng thái GK', 'Nhận xét GK'], null, 'A1');

        $topics = Topic::with(['lecturer', 'students'])
            ->whereNotNull('maGV_HD')
            ->orderBy('maDeTai')
            ->get();

        $row = 2;
        $index = 1;
        foreach ($topics as $topic) {
            $mssvList = $topic->students->pluck('mssv')->implode("\n");
            $hoTenList = $topic->students->pluck('hoTen')->implode("\n");
            $lopList = $topic->students->pluck('lop')->implode("\n");

            $sheet->setCellValue('A' . $row, $index++);
            $sheet->setCellValue('B' . $row, $mssvList);
            $sheet->setCellValue('C' . $row, $hoTenList);
            $sheet->setCellValue('D' . $row, $lopList);
            $sheet->setCellValue('E' . $row, $topic->tenDeTai);
            $sheet->setCellValue('F' . $row, $topic->lecturer?->tenGV);
            $sheet->setCellValue('G' . $row, $topic->diemGiuaKy);
            $sheet->setCellValue('H' . $row, $topic->trangThaiGiuaKy);
            $sheet->setCellValue('I' . $row, $topic->nhanXetGiuaKy);
            $row++;
        }

        return response()->streamDownload(function () use ($spreadsheet, $writerClass) {
            $writer = new $writerClass($spreadsheet);
            $writer->save('php://output');
        }, 'danh-sach-danh-gia-GK.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function exportCouncil()
    {
        $this->ensureOfficeLibraries();

        $spreadsheetClass = 'PhpOffice\\PhpSpreadsheet\\Spreadsheet';
        $writerClass = 'PhpOffice\\PhpSpreadsheet\\Writer\\Xlsx';
        $spreadsheet = new $spreadsheetClass();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray(['STT', 'Hội đồng', 'MSSV', 'Họ tên', 'Lớp', 'GVHD', 'Tên đề tài', 'Địa điểm'], null, 'A1');

        $rows = DB::table('hoidong as h')
            ->join('detai as dt', 'dt.maHoiDong', '=', 'h.maHoiDong')
            ->join('sinhvien as sv', 'sv.maDeTai', '=', 'dt.maDeTai')
            ->leftJoin('giangvien as gv', 'dt.maGV_HD', '=', 'gv.maGV')
            ->orderBy('h.tenHoiDong')
            ->orderBy('dt.tenDeTai')
            ->orderBy('sv.mssv')
            ->select('h.tenHoiDong', 'h.diaDiem', 'sv.mssv', 'sv.hoTen', 'sv.lop', 'dt.tenDeTai', 'gv.tenGV')
            ->get();

        $row = 2;
        $index = 1;
        foreach ($rows as $item) {
            $sheet->setCellValue('A' . $row, $index++);
            $sheet->setCellValue('B' . $row, $item->tenHoiDong);
            $sheet->setCellValue('C' . $row, $item->mssv);
            $sheet->setCellValue('D' . $row, $item->hoTen);
            $sheet->setCellValue('E' . $row, $item->lop);
            $sheet->setCellValue('F' . $row, $item->tenGV);
            $sheet->setCellValue('G' . $row, $item->tenDeTai);
            $sheet->setCellValue('H' . $row, $item->diaDiem);
            $row++;
        }

        return response()->streamDownload(function () use ($spreadsheet, $writerClass) {
            $writer = new $writerClass($spreadsheet);
            $writer->save('php://output');
        }, 'Danh_Sach_Hoi_Dong_' . now()->format('dmY_His') . '.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function exportReviewer(Request $request)
    {
        $this->ensureOfficeLibraries();

        $spreadsheetClass = 'PhpOffice\\PhpSpreadsheet\\Spreadsheet';
        $writerClass = 'PhpOffice\\PhpSpreadsheet\\Writer\\Xlsx';
        $spreadsheet = new $spreadsheetClass();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray(['STT', 'Tên đề tài', 'Thành viên', 'GVHD', 'GVPB', 'Điểm PB', 'Nhận xét PB'], null, 'A1');

        $authRole = (string) $request->attributes->get('auth_role', 'lecturer');
        $authUser = $request->attributes->get('auth_user');

        $query = Topic::with(['lecturer', 'reviewer', 'students'])
            ->whereNotNull('maGV_PB')
            ->orderBy('maMH');

        if ($authRole !== 'admin' && !empty($authUser?->maGV)) {
            $query->where('maGV_PB', $authUser->maGV);
        }

        $topics = $query->get();

        if ($topics->isEmpty()) {
            return response()->json([
                'message' => 'Không có dữ liệu để xuất. Bạn chưa được phân công phản biện nhóm nào.',
            ], 422);
        }

        $row = 2;
        $index = 1;
        foreach ($topics as $topic) {
            $members = $topic->students->map(function (Student $student) {
                return $student->hoTen . ' (' . $student->mssv . ')';
            })->implode("\n");

            $sheet->setCellValue('A' . $row, $index++);
            $sheet->setCellValue('B' . $row, $topic->tenDeTai);
            $sheet->setCellValue('C' . $row, $members);
            $sheet->setCellValue('D' . $row, $topic->lecturer?->tenGV);
            $sheet->setCellValue('E' . $row, $topic->reviewer?->tenGV);
            $sheet->setCellValue('F' . $row, $topic->diemPhanBien);
            $sheet->setCellValue('G' . $row, $topic->nhanXetPhanBien);
            $row++;
        }

        return response()->streamDownload(function () use ($spreadsheet, $writerClass) {
            $writer = new $writerClass($spreadsheet);
            $writer->save('php://output');
        }, 'Danh_Sach_Phan_Bien_' . now()->format('dmY_His') . '.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function exportSummary(Request $request)
    {
        $this->ensureOfficeLibraries();

        $type = $request->string('type')->toString() ?: 'single';
        $maHoiDong = $request->integer('maHoiDong');

        $query = DB::table('detai as dt')
            ->leftJoin('hoidong as h', 'dt.maHoiDong', '=', 'h.maHoiDong')
            ->leftJoin('giangvien as gv1', 'dt.maGV_HD', '=', 'gv1.maGV')
            ->leftJoin('giangvien as gv2', 'dt.maGV_PB', '=', 'gv2.maGV')
            ->whereNotNull('dt.maHoiDong')
            ->selectRaw("dt.maMH as Nhom, dt.tenDeTai, h.tenHoiDong, (SELECT GROUP_CONCAT(sv.mssv SEPARATOR '\n') FROM sinhvien sv WHERE sv.maDeTai = dt.maDeTai) AS MSSV, (SELECT GROUP_CONCAT(sv.hoTen SEPARATOR '\n') FROM sinhvien sv WHERE sv.maDeTai = dt.maDeTai) AS SinhVien, gv1.tenGV as GVHD, gv2.tenGV as GVPB, dt.diemHuongDan, dt.diemPhanBien, dt.diemHoiDong, dt.diemTongKet, dt.diemChu");

        if ($type === 'single' && $maHoiDong > 0) {
            $query->where('dt.maHoiDong', $maHoiDong);
        }

        $data = $query->orderBy('h.tenHoiDong')->get();

        $spreadsheetClass = 'PhpOffice\\PhpSpreadsheet\\Spreadsheet';
        $writerClass = 'PhpOffice\\PhpSpreadsheet\\Writer\\Xlsx';
        $spreadsheet = new $spreadsheetClass();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray(['Hội đồng', 'Nhóm', 'Tên đề tài', 'MSSV', 'Họ tên', 'GVHD', 'GVPB', 'Điểm GVHD', 'Điểm GVPB', 'Điểm HĐ', 'Tổng kết', 'Điểm chữ'], null, 'A1');

        $row = 2;
        foreach ($data as $item) {
            $sheet->setCellValue('A' . $row, $item->tenHoiDong);
            $sheet->setCellValue('B' . $row, $item->Nhom);
            $sheet->setCellValue('C' . $row, $item->tenDeTai);
            $sheet->setCellValue('D' . $row, $item->MSSV);
            $sheet->setCellValue('E' . $row, $item->SinhVien);
            $sheet->setCellValue('F' . $row, $item->GVHD);
            $sheet->setCellValue('G' . $row, $item->GVPB);
            $sheet->setCellValue('H' . $row, $item->diemHuongDan);
            $sheet->setCellValue('I' . $row, $item->diemPhanBien);
            $sheet->setCellValue('J' . $row, $item->diemHoiDong);
            $sheet->setCellValue('K' . $row, $item->diemTongKet);
            $sheet->setCellValue('L' . $row, $item->diemChu);
            $row++;
        }

        $filename = $type === 'single' ? 'Ket_Qua_Hoi_Dong_' . $maHoiDong . '.xlsx' : 'Tong_Ket_Khoa_Luan.xlsx';

        return response()->streamDownload(function () use ($spreadsheet, $writerClass) {
            $writer = new $writerClass($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function exportWordAssignment(Request $request)
    {
        $this->ensureOfficeLibraries();

        $templateFile = storage_path('app/templates/phieu_giao_de_tai.docx');
        if (!file_exists($templateFile)) {
            abort(404, 'Không tìm thấy template phieu_giao_de_tai.docx');
        }

        $validated = $request->validate([
            'hoTenSV1' => 'nullable|string',
            'mssv1' => 'nullable|string',
            'lop1' => 'nullable|string',
            'hoTenSV2' => 'nullable|string',
            'mssv2' => 'nullable|string',
            'lop2' => 'nullable|string',
            'tieuDe' => 'nullable|string',
            'nhiemVu' => 'nullable|string',
            'taiLieu' => 'nullable|string',
            'tenGVHD' => 'nullable|string',
            'ngayGiao' => 'nullable|date',
            'ngayHoanThanh' => 'nullable|date',
        ]);

        $templateProcessorClass = 'PhpOffice\\PhpWord\\TemplateProcessor';
        $templateProcessor = new $templateProcessorClass($templateFile);

        $templateProcessor->setValue('hoTenSV1', $validated['hoTenSV1'] ?? '');
        $templateProcessor->setValue('mssv1', $validated['mssv1'] ?? '');
        $templateProcessor->setValue('lop1', $validated['lop1'] ?? '');
        $templateProcessor->setValue('hoTenSV2', $validated['hoTenSV2'] ?? '');
        $templateProcessor->setValue('mssv2', $validated['mssv2'] ?? '');
        $templateProcessor->setValue('lop2', $validated['lop2'] ?? '');
        $templateProcessor->setValue('tieuDe', $validated['tieuDe'] ?? '');
        $templateProcessor->setValue('nhiemVu', str_replace("\n", '<w:br/>', $validated['nhiemVu'] ?? ''));
        $templateProcessor->setValue('taiLieu', str_replace("\n", '<w:br/>', $validated['taiLieu'] ?? ''));
        $templateProcessor->setValue('tenGVHD', $validated['tenGVHD'] ?? '');
        $templateProcessor->setValue('ngayGiao', !empty($validated['ngayGiao']) ? date('d/m/Y', strtotime($validated['ngayGiao'])) : '');
        $templateProcessor->setValue('ngayHoanThanh', !empty($validated['ngayHoanThanh']) ? date('d/m/Y', strtotime($validated['ngayHoanThanh'])) : '');

        $tmpFile = storage_path('app/' . Str::uuid() . '.docx');
        $templateProcessor->saveAs($tmpFile);

        return response()->download($tmpFile, 'Phieu-Giao-De-Tai-' . now()->format('Ymd-His') . '.docx')->deleteFileAfterSend(true);
    }

    public function exportWordGvhd(Request $request, Topic $topic)
    {
        $this->ensureOfficeLibraries();

        $validated = $request->validate([
            'maxPhanTich' => 'nullable|numeric|min:0',
            'maxThietKe' => 'nullable|numeric|min:0',
            'maxHienThuc' => 'nullable|numeric|min:0',
            'maxBaoCao' => 'nullable|numeric|min:0',
            'diemPhanTich1' => 'nullable|numeric|min:0',
            'diemThietKe1' => 'nullable|numeric|min:0',
            'diemHienThuc1' => 'nullable|numeric|min:0',
            'diemBaoCao1' => 'nullable|numeric|min:0',
            'diemTongCong1' => 'nullable|string',
            'diemFinal1' => 'nullable|string',
            'diemPhanTich2' => 'nullable|numeric|min:0',
            'diemThietKe2' => 'nullable|numeric|min:0',
            'diemHienThuc2' => 'nullable|numeric|min:0',
            'diemBaoCao2' => 'nullable|numeric|min:0',
            'diemTongCong2' => 'nullable|string',
            'diemFinal2' => 'nullable|string',
            'ndDieuChinh' => 'nullable|string',
            'nxTongQuat' => 'nullable|string',
            'uuDiem' => 'nullable|string',
            'thieuSot' => 'nullable|string',
            'cauHoi' => 'nullable|string',
            'thuyetMinh' => 'nullable|in:dat,khongdat',
            'deNghi' => 'nullable|in:duoc,khong,bosung',
        ]);

        $maxPhanTich = (float) ($validated['maxPhanTich'] ?? 0);
        $maxThietKe = (float) ($validated['maxThietKe'] ?? 0);
        $maxHienThuc = (float) ($validated['maxHienThuc'] ?? 0);
        $maxBaoCao = (float) ($validated['maxBaoCao'] ?? 0);

        $totalMax = $maxPhanTich + $maxThietKe + $maxHienThuc + $maxBaoCao;
        if ($totalMax == 0.0) {
            $totalMax = 10.0;
        }

        $sum1 = (float) ($validated['diemPhanTich1'] ?? 0)
            + (float) ($validated['diemThietKe1'] ?? 0)
            + (float) ($validated['diemHienThuc1'] ?? 0)
            + (float) ($validated['diemBaoCao1'] ?? 0);
        $finalScore1 = ($sum1 / $totalMax) * 10;

        $sum2 = (float) ($validated['diemPhanTich2'] ?? 0)
            + (float) ($validated['diemThietKe2'] ?? 0)
            + (float) ($validated['diemHienThuc2'] ?? 0)
            + (float) ($validated['diemBaoCao2'] ?? 0);

        $diemTongKetHD = $finalScore1;
        if ($sum2 > 0) {
            $finalScore2 = ($sum2 / $totalMax) * 10;
            $diemTongKetHD = ($finalScore1 + $finalScore2) / 2;
        }

        $topic->update(['diemHuongDan' => $diemTongKetHD]);

        $students = Student::where('maDeTai', $topic->maDeTai)->orderBy('mssv')->get();
        $templateFile = $students->count() > 1
            ? storage_path('app/templates/template_chamdiem_hd_2sv.docx')
            : storage_path('app/templates/template_chamdiem_hd_1sv.docx');

        if (!file_exists($templateFile)) {
            abort(404, 'Không tìm thấy template chấm điểm GVHD');
        }

        $templateProcessorClass = 'PhpOffice\\PhpWord\\TemplateProcessor';
        $templateProcessor = new $templateProcessorClass($templateFile);
        $templateProcessor->setValue('tenDeTai', $topic->tenDeTai ?? '');
        $templateProcessor->setValue('tenGVHD', Teacher::where('maGV', $topic->maGV_HD)->value('tenGV') ?? '');
        $templateProcessor->setValue('ngayCham', now()->format('d/m/Y'));
        $templateProcessor->setValue('maxPhanTich', (string) $maxPhanTich);
        $templateProcessor->setValue('maxThietKe', (string) $maxThietKe);
        $templateProcessor->setValue('maxHienThuc', (string) $maxHienThuc);
        $templateProcessor->setValue('maxBaoCao', (string) $maxBaoCao);

        if (isset($students[0])) {
            $templateProcessor->setValue('hoTenSV1', $students[0]->hoTen ?? '');
            $templateProcessor->setValue('mssv1', $students[0]->mssv ?? '');
            $templateProcessor->setValue('lop1', $students[0]->lop ?? '');
        }

        $templateProcessor->setValue('diemPhanTich1', (string) ($validated['diemPhanTich1'] ?? ''));
        $templateProcessor->setValue('diemThietKe1', (string) ($validated['diemThietKe1'] ?? ''));
        $templateProcessor->setValue('diemHienThuc1', (string) ($validated['diemHienThuc1'] ?? ''));
        $templateProcessor->setValue('diemBaoCao1', (string) ($validated['diemBaoCao1'] ?? ''));
        $templateProcessor->setValue('diemTongCong1', (string) ($validated['diemTongCong1'] ?? ''));
        $templateProcessor->setValue('diemFinal1', (string) ($validated['diemFinal1'] ?? ''));

        if (isset($students[1])) {
            $templateProcessor->setValue('hoTenSV2', $students[1]->hoTen ?? '');
            $templateProcessor->setValue('mssv2', $students[1]->mssv ?? '');
            $templateProcessor->setValue('lop2', $students[1]->lop ?? '');

            $templateProcessor->setValue('diemPhanTich2', (string) ($validated['diemPhanTich2'] ?? ''));
            $templateProcessor->setValue('diemThietKe2', (string) ($validated['diemThietKe2'] ?? ''));
            $templateProcessor->setValue('diemHienThuc2', (string) ($validated['diemHienThuc2'] ?? ''));
            $templateProcessor->setValue('diemBaoCao2', (string) ($validated['diemBaoCao2'] ?? ''));
            $templateProcessor->setValue('diemTongCong2', (string) ($validated['diemTongCong2'] ?? ''));
            $templateProcessor->setValue('diemFinal2', (string) ($validated['diemFinal2'] ?? ''));
        }

        $templateProcessor->setValue('ndDieuChinh', $this->toWordMultiline($validated['ndDieuChinh'] ?? '...'));
        $templateProcessor->setValue('nxTongQuat', $this->toWordMultiline($validated['nxTongQuat'] ?? '...'));
        $templateProcessor->setValue('uuDiem', $this->toWordMultiline($validated['uuDiem'] ?? '...'));
        $templateProcessor->setValue('thieuSot', $this->toWordMultiline($validated['thieuSot'] ?? '...'));
        $templateProcessor->setValue('cauHoi', $this->toWordMultiline($validated['cauHoi'] ?? '...'));

        $thuyetMinh = (string) ($validated['thuyetMinh'] ?? 'dat');
        $deNghi = (string) ($validated['deNghi'] ?? 'duoc');
        $templateProcessor->setValue('thuyetMinh_Dat', $thuyetMinh === 'dat' ? 'X' : '');
        $templateProcessor->setValue('thuyetMinh_KhongDat', $thuyetMinh === 'khongdat' ? 'X' : '');
        $templateProcessor->setValue('deNghi_Duoc', $deNghi === 'duoc' ? 'X' : '');
        $templateProcessor->setValue('deNghi_Khong', $deNghi === 'khong' ? 'X' : '');
        $templateProcessor->setValue('deNghi_BoSung', $deNghi === 'bosung' ? 'X' : '');

        $tmpFile = storage_path('app/' . Str::uuid() . '.docx');
        $templateProcessor->saveAs($tmpFile);

        return response()->download($tmpFile, 'Phieu-Cham-Diem-GVHD-' . Str::slug($topic->tenDeTai ?? 'detai') . '.docx')->deleteFileAfterSend(true);
    }

    public function exportWordGvpb(Request $request, Topic $topic)
    {
        $this->ensureOfficeLibraries();

        $validated = $request->validate([
            'maxPhanTich' => 'nullable|numeric|min:0',
            'maxThietKe' => 'nullable|numeric|min:0',
            'maxHienThuc' => 'nullable|numeric|min:0',
            'maxBaoCao' => 'nullable|numeric|min:0',
            'diemPhanTich1_PB' => 'nullable|numeric|min:0',
            'diemThietKe1_PB' => 'nullable|numeric|min:0',
            'diemHienThuc1_PB' => 'nullable|numeric|min:0',
            'diemBaoCao1_PB' => 'nullable|numeric|min:0',
            'diemTongCong1_PB' => 'nullable|string',
            'diemFinal1_PB' => 'nullable|string',
            'diemPhanTich2_PB' => 'nullable|numeric|min:0',
            'diemThietKe2_PB' => 'nullable|numeric|min:0',
            'diemHienThuc2_PB' => 'nullable|numeric|min:0',
            'diemBaoCao2_PB' => 'nullable|numeric|min:0',
            'diemTongCong2_PB' => 'nullable|string',
            'diemFinal2_PB' => 'nullable|string',
            'nxTongQuat_PB' => 'nullable|string',
            'uuDiem_PB' => 'nullable|string',
            'thieuSot_PB' => 'nullable|string',
            'cauHoi_PB' => 'nullable|string',
            'thuyetMinh_PB' => 'nullable|in:dat,khongdat',
            'deNghi_PB' => 'nullable|in:duoc,khong,bosung',
        ]);

        $maxPhanTich = (float) ($validated['maxPhanTich'] ?? 0);
        $maxThietKe = (float) ($validated['maxThietKe'] ?? 0);
        $maxHienThuc = (float) ($validated['maxHienThuc'] ?? 0);
        $maxBaoCao = (float) ($validated['maxBaoCao'] ?? 0);

        $totalMax = $maxPhanTich + $maxThietKe + $maxHienThuc + $maxBaoCao;
        if ($totalMax == 0.0) {
            $totalMax = 10.0;
        }

        $sum1 = (float) ($validated['diemPhanTich1_PB'] ?? 0)
            + (float) ($validated['diemThietKe1_PB'] ?? 0)
            + (float) ($validated['diemHienThuc1_PB'] ?? 0)
            + (float) ($validated['diemBaoCao1_PB'] ?? 0);
        $finalScore1 = ($sum1 / $totalMax) * 10;

        $sum2 = (float) ($validated['diemPhanTich2_PB'] ?? 0)
            + (float) ($validated['diemThietKe2_PB'] ?? 0)
            + (float) ($validated['diemHienThuc2_PB'] ?? 0)
            + (float) ($validated['diemBaoCao2_PB'] ?? 0);

        $diemTongKetPB = $finalScore1;
        if ($sum2 > 0) {
            $finalScore2 = ($sum2 / $totalMax) * 10;
            $diemTongKetPB = ($finalScore1 + $finalScore2) / 2;
        }

        $topic->update(['diemPhanBien' => $diemTongKetPB]);

        $students = Student::where('maDeTai', $topic->maDeTai)->orderBy('mssv')->get();
        $templateFile = $students->count() > 1
            ? storage_path('app/templates/template_chamdiem_pb_2sv.docx')
            : storage_path('app/templates/template_chamdiem_pb_1sv.docx');

        if (!file_exists($templateFile)) {
            abort(404, 'Không tìm thấy template chấm điểm GVPB');
        }

        $templateProcessorClass = 'PhpOffice\\PhpWord\\TemplateProcessor';
        $templateProcessor = new $templateProcessorClass($templateFile);
        $templateProcessor->setValue('tenDeTai', $topic->tenDeTai ?? '');
        $templateProcessor->setValue('tenGVPB', Teacher::where('maGV', $topic->maGV_PB)->value('tenGV') ?? '');
        $templateProcessor->setValue('ngayCham', now()->format('d/m/Y'));
        $templateProcessor->setValue('maxPhanTich', (string) $maxPhanTich);
        $templateProcessor->setValue('maxThietKe', (string) $maxThietKe);
        $templateProcessor->setValue('maxHienThuc', (string) $maxHienThuc);
        $templateProcessor->setValue('maxBaoCao', (string) $maxBaoCao);

        if (isset($students[0])) {
            $templateProcessor->setValue('hoTenSV1', $students[0]->hoTen ?? '');
            $templateProcessor->setValue('mssv1', $students[0]->mssv ?? '');
            $templateProcessor->setValue('lop1', $students[0]->lop ?? '');
        }

        $templateProcessor->setValue('diemPhanTich1_PB', (string) ($validated['diemPhanTich1_PB'] ?? ''));
        $templateProcessor->setValue('diemThietKe1_PB', (string) ($validated['diemThietKe1_PB'] ?? ''));
        $templateProcessor->setValue('diemHienThuc1_PB', (string) ($validated['diemHienThuc1_PB'] ?? ''));
        $templateProcessor->setValue('diemBaoCao1_PB', (string) ($validated['diemBaoCao1_PB'] ?? ''));
        $templateProcessor->setValue('diemTongCong1_PB', (string) ($validated['diemTongCong1_PB'] ?? ''));
        $templateProcessor->setValue('diemFinal1_PB', (string) ($validated['diemFinal1_PB'] ?? ''));

        if (isset($students[1])) {
            $templateProcessor->setValue('hoTenSV2', $students[1]->hoTen ?? '');
            $templateProcessor->setValue('mssv2', $students[1]->mssv ?? '');
            $templateProcessor->setValue('lop2', $students[1]->lop ?? '');

            $templateProcessor->setValue('diemPhanTich2_PB', (string) ($validated['diemPhanTich2_PB'] ?? ''));
            $templateProcessor->setValue('diemThietKe2_PB', (string) ($validated['diemThietKe2_PB'] ?? ''));
            $templateProcessor->setValue('diemHienThuc2_PB', (string) ($validated['diemHienThuc2_PB'] ?? ''));
            $templateProcessor->setValue('diemBaoCao2_PB', (string) ($validated['diemBaoCao2_PB'] ?? ''));
            $templateProcessor->setValue('diemTongCong2_PB', (string) ($validated['diemTongCong2_PB'] ?? ''));
            $templateProcessor->setValue('diemFinal2_PB', (string) ($validated['diemFinal2_PB'] ?? ''));
        }

        $templateProcessor->setValue('nxTongQuat_PB', $this->toWordMultiline($validated['nxTongQuat_PB'] ?? '...'));
        $templateProcessor->setValue('uuDiem_PB', $this->toWordMultiline($validated['uuDiem_PB'] ?? '...'));
        $templateProcessor->setValue('thieuSot_PB', $this->toWordMultiline($validated['thieuSot_PB'] ?? '...'));
        $templateProcessor->setValue('cauHoi_PB', $this->toWordMultiline($validated['cauHoi_PB'] ?? '...'));

        $thuyetMinh = (string) ($validated['thuyetMinh_PB'] ?? 'dat');
        $deNghi = (string) ($validated['deNghi_PB'] ?? 'duoc');
        $templateProcessor->setValue('thuyetMinh_Dat_PB', $thuyetMinh === 'dat' ? 'X' : '');
        $templateProcessor->setValue('thuyetMinh_KhongDat_PB', $thuyetMinh === 'khongdat' ? 'X' : '');
        $templateProcessor->setValue('deNghi_Duoc_PB', $deNghi === 'duoc' ? 'X' : '');
        $templateProcessor->setValue('deNghi_Khong_PB', $deNghi === 'khong' ? 'X' : '');
        $templateProcessor->setValue('deNghi_BoSung_PB', $deNghi === 'bosung' ? 'X' : '');

        $tmpFile = storage_path('app/' . Str::uuid() . '.docx');
        $templateProcessor->saveAs($tmpFile);

        return response()->download($tmpFile, 'Phieu-Cham-Diem-GVPB-' . Str::slug($topic->tenDeTai ?? 'detai') . '.docx')->deleteFileAfterSend(true);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\SinhVien;
use App\Models\TopicRegistrationForm;
use App\Models\DeTai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\IReadFilter;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;

// =====================================================================
// BỨC TƯỜNG VẬT LÝ: CHẶN DÒNG MA & CỘT MA (CHỐNG TREO MÁY)
// =====================================================================
class LimitReadFilter implements IReadFilter
{
    public function readCell(string $columnAddress, int $row, string $worksheetName = ''): bool {
        if ($row > 1500) return false;
        $columnIndex = Coordinate::columnIndexFromString($columnAddress);
        if ($columnIndex > 30) return false;
        return true; 
    }
}

class TopicRegistrationFormController extends Controller
{
    // 1. Duyệt từng hàng (Sử dụng khi nhấn nút Duyệt ở cuối mỗi dòng)
    public function approve($id)
    {
        $form = TopicRegistrationForm::findOrFail($id);
        if ($form->status === 'da_duyet') {
            return response()->json(['message' => 'Bản đăng ký đã được duyệt trước đó!'], 400);
        }

        DB::beginTransaction();
        try {
            // Tạo đề tài mới để lấy maDeTai (Tên đề tài để NULL chờ GVHD nhập sau)
            $deTai = DeTai::create([
                'tenDeTai' => ($form->topic_title === 'Chưa có tên đề tài') ? null : $form->topic_title,
                'moTa' => $form->topic_description, // Hướng đề tài
                'trangThai' => null
            ]);

            $maDeTaiMoi = $deTai->maDeTai;

            // Cập nhật maDeTai vào bảng sinhvien cho SV1
            SinhVien::where('mssv', $form->student1_id)->update(['maDeTai' => $maDeTaiMoi]);

            // Cập nhật cho SV2 nếu là nhóm 2 người
            if ($form->topic_type === 'hai_sinh_vien' && $form->student2_id) {
                SinhVien::where('mssv', $form->student2_id)->update(['maDeTai' => $maDeTaiMoi]);
            }

            $form->status = 'da_duyet';
            $form->save();

            DB::commit();
            return response()->json([
                'message' => 'Đã duyệt và cấp mã đề tài thành công!',
                'maDeTai' => $maDeTaiMoi
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    // 2. Duyệt TOÀN BỘ (Sử dụng khi nhấn nút Duyệt TOÀN BỘ hệ thống ở phía trên)
    public function approveAllPending(Request $request)
    {
        $forms = TopicRegistrationForm::where('status', 'cho_duyet')->get();

        if ($forms->isEmpty()) {
            return response()->json(['message' => 'Hệ thống hiện không có bản ghi nào cần duyệt!'], 400);
        }

        DB::beginTransaction();
        try {
            foreach ($forms as $form) {
                // Tạo đề tài cho từng form
                $deTai = DeTai::create([
                    'tenDeTai' => ($form->topic_title === 'Chưa có tên đề tài') ? null : $form->topic_title,
                    'moTa' => $form->topic_description,
                    'trangThai' => null
                ]);

                $maDeTaiMoi = $deTai->maDeTai;

                // Gắn mã đề tài cho sinh viên
                SinhVien::where('mssv', $form->student1_id)->update(['maDeTai' => $maDeTaiMoi]);
                if ($form->topic_type === 'hai_sinh_vien' && $form->student2_id) {
                    SinhVien::where('mssv', $form->student2_id)->update(['maDeTai' => $maDeTaiMoi]);
                }

                $form->status = 'da_duyet';
                $form->save();
            }

            DB::commit();
            return response()->json(['message' => 'Đã duyệt toàn bộ ' . $forms->count() . ' bản đăng ký thành công!']);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }
    public function index(Request $request)
    {
        $query = TopicRegistrationForm::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('student1_id', 'like', "%$s%")
                    ->orWhere('student1_name', 'like', "%$s%")
                    ->orWhere('student2_id', 'like', "%$s%")
                    ->orWhere('student2_name', 'like', "%$s%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest('registered_at')->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'topic_title' => 'nullable|string|max:255',
            'topic_description' => 'nullable|string',
            'topic_type' => 'required|in:mot_sinh_vien,hai_sinh_vien',
            'student1_id' => 'required|string|max:20',
            'student1_name' => 'required|string|max:255',
            'student1_class' => 'required|string|max:50',
            'student1_email' => 'nullable|email|max:255',
            'student2_id' => 'nullable|string|max:20',
            'student2_name' => 'nullable|string|max:255',
            'student2_class' => 'nullable|string|max:50',
            'student2_email' => 'nullable|email|max:255',
            'gvhd_code' => 'nullable|string|max:20',
            'gvpb_code' => 'nullable|string|max:20',
            'gvhd_workplace' => 'nullable|string|max:255',
            'note' => 'nullable|string',
            'status' => 'nullable|in:cho_duyet,da_duyet,tu_choi',
            'source' => 'nullable|string|max:50',
        ]);

        if (empty($data['topic_title'])) {
            $data['topic_title'] = 'Chưa có tên đề tài';
        }

        $form = TopicRegistrationForm::create($data);

        SinhVien::updateOrCreate(
            ['mssv' => $data['student1_id']],
            ['hoTen' => $data['student1_name'], 'lop' => $data['student1_class'], 'email' => $data['student1_email'] ?? null]
        );
        if (!empty($data['student2_id'])) {
            SinhVien::updateOrCreate(
                ['mssv' => $data['student2_id']],
                ['hoTen' => $data['student2_name'] ?? '', 'lop' => $data['student2_class'] ?? null, 'email' => $data['student2_email'] ?? null]
            );
        }

        return response()->json(['data' => $form], 201);
    }

    public function update(Request $request, $id)
    {
        $form = TopicRegistrationForm::findOrFail($id);

        $data = $request->validate([
            'topic_title' => 'nullable|string|max:255',
            'topic_description' => 'nullable|string',
            'topic_type' => 'sometimes|required|in:mot_sinh_vien,hai_sinh_vien',
            'student1_id' => 'sometimes|required|string|max:20',
            'student1_name' => 'sometimes|required|string|max:255',
            'student1_class' => 'sometimes|required|string|max:50',
            'student1_email' => 'nullable|email|max:255',
            'student2_id' => 'nullable|string|max:20',
            'student2_name' => 'nullable|string|max:255',
            'student2_class' => 'nullable|string|max:50',
            'student2_email' => 'nullable|email|max:255',
            'gvhd_code' => 'nullable|string|max:20',
            'gvpb_code' => 'nullable|string|max:20',
            'gvhd_workplace' => 'nullable|string|max:255',
            'note' => 'nullable|string',
            'status' => 'nullable|in:cho_duyet,da_duyet,tu_choi',
            'source' => 'nullable|string|max:50',
        ]);

        $form->update($data);

        return response()->json(['data' => $form]);
    }

    public function destroy($id)
    {
        $form = TopicRegistrationForm::findOrFail($id);
        $form->delete();

        return response()->json(['message' => 'Đã xóa']);
    }

    // =====================================================================
    // HÀM IMPORT EXCEL CHÍNH THỨC
    // =====================================================================
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv', 
        ]);

        DB::beginTransaction();

        try {
            $reader = IOFactory::createReaderForFile($request->file('file')->getPathname());
            $reader->setReadDataOnly(true);
            $reader->setReadFilter(new LimitReadFilter()); 
            $spreadsheet = $reader->load($request->file('file')->getPathname());

            $groups = [];

            // QUÉT TẤT CẢ CÁC SHEET
            foreach ($spreadsheet->getAllSheets() as $sheet) {
                $rows = $sheet->toArray(null, true, true, false);
                $headerFound = false;
                $idx = [];
                $rowCount = 0;

                foreach ($rows as $cells) {
                    $rowCount++;
                    
                    // Chống lặp vô hạn ở các sheet trống
                    if (!$headerFound && $rowCount > 50) {
                        break; 
                    }

                    // TÌM HEADER CỘT
                    if (!$headerFound) {
                        $tempMssv = $this->findHeaderIndex($cells, ['MSSV', 'Mã SV', 'Mã sinh viên']);
                        $tempHoTen = $this->findHeaderIndex($cells, ['HỌ TÊN', 'Họ và tên', 'Họ tên sinh viên']);
                        
                        if ($tempMssv !== null && $tempHoTen !== null) {
                            $idx = [
                                'mssv' => $tempMssv,
                                'hoTen' => $tempHoTen,
                                'lop' => $this->findHeaderIndex($cells, ['LỚP', 'Lớp']),
                                'sdt' => $this->findHeaderIndex($cells, ['SĐT', 'Số điện thoại', 'Điện thoại']),
                                'email' => $this->findHeaderIndex($cells, ['Email']),
                                'huongDT' => $this->findHeaderIndex($cells, ['Hướng đề tài']),
                                'nhom' => $this->findHeaderIndex($cells, ['Nhóm']),
                            ];
                            $headerFound = true;
                        }
                        continue;
                    }

                    // ĐỌC DỮ LIỆU
                    $mssv = $this->normalizeExcelText($cells[$idx['mssv']] ?? '');
                    if ($mssv === '') continue;

                    // Ghép Họ và Tên nếu file Excel tách 2 cột
                    $hoTen = trim($this->normalizeExcelText($cells[$idx['hoTen']] ?? ''));
                    if (isset($cells[$idx['hoTen'] + 1]) && ($idx['hoTen'] + 1 !== $idx['lop'])) {
                        $nextCell = trim($this->normalizeExcelText($cells[$idx['hoTen'] + 1]));
                        // Bỏ qua nếu cột kế tiếp là chữ cái của Lớp (như TH1, TH2...)
                        if ($nextCell !== '' && !preg_match('/\d/', $nextCell)) {
                            $hoTen .= ' ' . $nextCell;
                        }
                    }

                    // Gom Nhóm: Nếu không có cột nhóm hoặc trống -> Tự tạo mã nhóm đơn (single_...)
                    $groupID = ($idx['nhom'] !== null && trim((string)($cells[$idx['nhom']] ?? '')) !== '') 
                                ? trim((string)($cells[$idx['nhom']])) 
                                : 'single_' . $rowCount;

                    $groups[$groupID][] = [
                        'mssv' => $mssv,
                        'hoTen' => $hoTen,
                        'lop' => $idx['lop'] !== null ? $this->normalizeExcelText($cells[$idx['lop']] ?? '') : 'Không rõ',
                        'sdt' => $idx['sdt'] !== null ? $this->normalizeExcelText($cells[$idx['sdt']] ?? '') : '',
                        'email' => $idx['email'] !== null ? $this->normalizeExcelText($cells[$idx['email']] ?? '') : '',
                        'huongDT' => $idx['huongDT'] !== null ? $this->normalizeExcelText($cells[$idx['huongDT']] ?? '') : 'Chưa xác định',
                    ];
                }
            }

            $importedCount = 0;
            $sinhVienBatch = [];
            $formsBatch = [];
            $defaultPassword = '123'; // Pass mặc định không mã hóa

            // GỘP NHÓM & CHUẨN BỊ DATA
            foreach ($groups as $groupID => $members) {
                $count = count($members);
                if ($count === 0) continue;

                $sv1 = $members[0];
                
                // Nạp SV1 vào danh sách tạo tài khoản
                $sinhVienBatch[$sv1['mssv']] = [
                    'mssv' => $sv1['mssv'], 'hoTen' => $sv1['hoTen'], 'lop' => $sv1['lop'], 
                    'soDienThoai' => $sv1['sdt'], 'email' => $sv1['email'], 'matKhau' => $defaultPassword
                ];

                // BỘ KHUNG CHUẨN (Đủ 15 cột để tránh lỗi #1136 Column Count)
                $baseData = [
                    'topic_title' => 'Chưa có tên đề tài',
                    'topic_description' => $sv1['huongDT'],
                    'student1_id' => $sv1['mssv'],
                    'student1_name' => $sv1['hoTen'],
                    'student1_class' => $sv1['lop'],
                    'student1_email' => $sv1['email'],
                    'student2_id' => null,     // Rất quan trọng để chốt form 15 cột
                    'student2_name' => null,   
                    'student2_class' => null,  
                    'student2_email' => null,  
                    'status' => 'cho_duyet',
                    'source' => 'excel_import',
                    'registered_at' => now(),
                ];

                if ($count >= 2) {
                    $sv2 = $members[1];
                    
                    // Nạp SV2 vào danh sách tạo tài khoản
                    $sinhVienBatch[$sv2['mssv']] = [
                        'mssv' => $sv2['mssv'], 'hoTen' => $sv2['hoTen'], 'lop' => $sv2['lop'], 
                        'soDienThoai' => $sv2['sdt'], 'email' => $sv2['email'], 'matKhau' => $defaultPassword
                    ];

                    $formsBatch[] = array_merge($baseData, [
                        'topic_type' => 'hai_sinh_vien',
                        'student2_id' => $sv2['mssv'],
                        'student2_name' => $sv2['hoTen'],
                        'student2_class' => $sv2['lop'],
                        'student2_email' => $sv2['email'],
                        'note' => "Nhóm: $groupID | SĐT1: " . $sv1['sdt'] . " | SĐT2: " . $sv2['sdt'],
                    ]);
                } else {
                    $formsBatch[] = array_merge($baseData, [
                        'topic_type' => 'mot_sinh_vien',
                        'note' => (str_contains($groupID, 'single_')) ? "SĐT: " . $sv1['sdt'] : "Nhóm: $groupID | SĐT: " . $sv1['sdt'],
                    ]);
                }
                $importedCount++;
            }

            // TIẾN HÀNH UPSERT HÀNG LOẠT XUỐNG DATABASE
            if (!empty($sinhVienBatch)) {
                // Upsert Sinh viên: Tự tạo mới nếu chưa có, nếu có rồi thì update thông tin liên hệ
                SinhVien::upsert(array_values($sinhVienBatch), ['mssv'], ['hoTen', 'lop', 'email', 'soDienThoai']);
            }
            
            if (!empty($formsBatch)) {
                // Cắt nhỏ mảng ra mỗi lần 100 dòng để DB không bị quá tải
                foreach (array_chunk($formsBatch, 100) as $chunk) {
                    TopicRegistrationForm::upsert($chunk, ['student1_id', 'topic_type'], [
                        'topic_title', 'topic_description', 'student1_name', 'student1_class', 'student1_email',
                        'student2_id', 'student2_name', 'student2_class', 'student2_email', 'note', 'status', 'registered_at'
                    ]);
                }
            }

            DB::commit();
            return response()->json(['success' => true, 'imported' => $importedCount]);
            
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    // =====================================================================
    // HÀM BỔ TRỢ XỬ LÝ CHUỖI
    // =====================================================================
    private function normalizeExcelText($value): string {
        if ($value instanceof \DateTimeInterface) return $value->format('Y-m-d H:i:s');
        return trim(preg_replace('/\s+/u', ' ', (string) $value));
    }

    private function findHeaderIndex(array $header, array $needles): ?int {
        foreach ($header as $i => $col) {
            $col = $this->normalizeExcelText($col);
            // Dùng mb_stripos để tìm kiếm không phân biệt hoa thường với Tiếng Việt
            foreach ($needles as $needle) {
                if (mb_stripos($col, $needle) !== false) return $i;
            }
        }
        return null;
    }
}
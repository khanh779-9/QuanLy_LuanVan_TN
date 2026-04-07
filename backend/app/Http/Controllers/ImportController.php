<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Topic;
use App\Models\Teacher;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportController extends Controller
{
    public function importFullData(Request $request)
    {
        $request->validate(['file' => 'required|mimes:xlsx,xls,csv']);
        $file = $request->file('file');
        
        // Load file và chỉ lấy Sheet đầu tiên (Sheet DSSV_ĐK_HƯỚNG ĐỀ TÀI)
        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
        $sheet = $spreadsheet->getSheet(0); 
        $data = $sheet->toArray();

        $count = 0;
        try {
            DB::transaction(function () use ($data, &$count) {
                foreach ($data as $index => $row) {
                    // BỎ QUA RÁC: Nếu cột MSSV (index 1) trống hoặc không bắt đầu bằng chữ 'DH' thì bỏ qua
                    $mssv = trim((string)($row[1] ?? ''));
                    if (empty($mssv) || !str_starts_with(strtoupper($mssv), 'DH')) {
                        continue; 
                    }

                    // 1. TẠO/CẬP NHẬT GIẢNG VIÊN (Cột J -> index 9)
                    $tenGV = trim((string)($row[9] ?? ''));
                    $gvhd = null;
                    if ($tenGV !== '') {
                        $gvhd = Teacher::firstOrCreate(
                            ['tenGV' => $tenGV],
                            ['maGV' => 'GV' . Str::random(5)]
                        );
                    }

                    // 2. TẠO/CẬP NHẬT ĐỀ TÀI (Cột M -> index 12)
                    $tenDeTai = trim((string)($row[12] ?? ''));
                    if ($tenDeTai === '') {
                        // Nếu đề tài trống, mượn số "Nhóm" (Cột I -> index 8) để đặt tên tạm, giúp gom 2 SV chung 1 nhóm
                        $nhom = trim((string)($row[8] ?? '0'));
                        $tenDeTai = "Chưa cập nhật tên đề tài - Nhóm " . $nhom;
                    }

                    $topic = null;
                    if ($gvhd) {
                        $topic = Topic::firstOrCreate(
                            ['tenDeTai' => $tenDeTai, 'maGV_HD' => $gvhd->maGV],
                            ['diemHuongDan' => null]
                        );
                    }

                    // 3. TẠO/CẬP NHẬT SINH VIÊN
                    // Ghép Họ lót (Cột C -> index 2) và Tên (Cột D -> index 3)
                    $ho = trim((string)($row[2] ?? ''));
                    $ten = trim((string)($row[3] ?? ''));
                    $hoTen = trim($ho . ' ' . $ten);
                    
                    Student::updateOrCreate(
                        ['mssv' => $mssv],
                        [
                            'hoTen' => $hoTen, 
                            'lop' => trim((string)($row[4] ?? '')),
                            'soDienThoai' => trim((string)($row[5] ?? '')),
                            'email' => trim((string)($row[6] ?? '')),
                            'maDeTai' => $topic ? $topic->maDeTai : null
                        ]
                    );
                    $count++;
                }
            });
            return response()->json(['message' => "Đỉnh cao! Đã import thành công $count dòng dữ liệu chuẩn từ phòng Đào Tạo!"]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi Import: ' . $e->getMessage()], 500);
        }
    }
}
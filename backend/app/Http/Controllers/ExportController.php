<?php

namespace App\Http\Controllers;

use App\Models\Topic;
use App\Models\CouncilMember;
use App\Models\Teacher;

class ExportController extends Controller
{
    // ==========================================
    // 1. XUẤT FILE EXCEL
    // ==========================================
    public function exportExcelList()
    {
        $topics = Topic::with(['students', 'lecturer'])->get();
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $headers = ['STT', 'MSSV', 'HỌ VÀ TÊN', 'LỚP', 'TÊN ĐỀ TÀI', 'GVHD'];
        $sheet->fromArray($headers, null, 'A1');

        $row = 2; $stt = 1;
        foreach ($topics as $topic) {
            foreach ($topic->students as $student) {
                $sheet->setCellValue('A' . $row, $stt++);
                $sheet->setCellValue('B' . $row, $student->mssv);
                $sheet->setCellValue('C' . $row, $student->hoTen);
                $sheet->setCellValue('D' . $row, $student->lop);
                $sheet->setCellValue('E' . $row, $topic->tenDeTai);
                $sheet->setCellValue('F' . $row, $topic->lecturer->tenGV ?? '');
                $row++;
            }
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $path = storage_path('app/DanhSach_LVTN.xlsx');
        $writer->save($path);
        return response()->download($path)->deleteFileAfterSend(true);
    } // <--- ĐẤY! PHẢI CÓ DẤU NGOẶC NÀY ĐỂ KẾT THÚC HÀM EXCEL!

    // ==========================================
    // 2. XUẤT FILE WORD NHIỆM VỤ
    // ==========================================
    public function exportAssignmentWord(Topic $topic) {
        $topic->load(['students', 'lecturer']);
        $template = new \PhpOffice\PhpWord\TemplateProcessor(base_path('templates/Form_Nhiemvu.docx'));
        
        $sv1 = $topic->students->first();
        $sv2 = $topic->students->skip(1)->first();
        $template->setValue('tenDeTai', $topic->tenDeTai ?? '');
        $template->setValue('tenGVHD', $topic->lecturer->tenGV ?? '');
        $template->setValue('tenSV1', $sv1->hoTen ?? '');
        $template->setValue('mssv1', $sv1->mssv ?? '');
        $template->setValue('lop1', $sv1->lop ?? '');
        $template->setValue('tenSV2', $sv2->hoTen ?? '');
        $template->setValue('mssv2', $sv2->mssv ?? '');
        $template->setValue('lop2', $sv2->lop ?? '');
        
        $path = storage_path('app/temp_nv_' . $topic->maDeTai . '.docx');
        $template->saveAs($path);
        return response()->download($path)->deleteFileAfterSend(true);
    }

    // ==========================================
    // 3. XUẤT FILE WORD PHIẾU CHẤM GVHD
    // ==========================================
    public function exportHdWord(Topic $topic) {
        $topic->load(['students', 'lecturer']);
        $file = $topic->students->count() > 1 ? 'PhieuCham_HD_Nhom.docx' : 'PhieuCham_HD_CaNhan.docx';
        $template = new \PhpOffice\PhpWord\TemplateProcessor(base_path('templates/' . $file));
        
        $sv1 = $topic->students->first();
        $sv2 = $topic->students->skip(1)->first();
        $template->setValue('tenDeTai', $topic->tenDeTai ?? '');
        $template->setValue('tenGV', $topic->lecturer->tenGV ?? '');
        $template->setValue('tenSV1', $sv1->hoTen ?? '');
        $template->setValue('mssv1', $sv1->mssv ?? '');
        $template->setValue('lop1', $sv1->lop ?? '');
        $template->setValue('tenSV2', $sv2->hoTen ?? '');
        $template->setValue('mssv2', $sv2->mssv ?? '');
        $template->setValue('lop2', $sv2->lop ?? '');
        
        $path = storage_path('app/temp_hd_' . $topic->maDeTai . '.docx');
        $template->saveAs($path);
        return response()->download($path)->deleteFileAfterSend(true);
    }

    // ==========================================
    // 4. XUẤT FILE WORD PHIẾU CHẤM GVPB
    // ==========================================
    public function exportPbWord(Topic $topic) {
        $topic->load(['students', 'reviewer']);
        $file = $topic->students->count() > 1 ? 'PhieuCham_PB_Nhom.docx' : 'PhieuCham_PB_CaNhan.docx';
        $template = new \PhpOffice\PhpWord\TemplateProcessor(base_path('templates/' . $file));
        
        $sv1 = $topic->students->first();
        $sv2 = $topic->students->skip(1)->first();
        $template->setValue('tenDeTai', $topic->tenDeTai ?? '');
        $template->setValue('tenGVPB', $topic->reviewer->tenGV ?? '');
        $template->setValue('tenSV1', $sv1->hoTen ?? '');
        $template->setValue('mssv1', $sv1->mssv ?? '');
        $template->setValue('lop1', $sv1->lop ?? '');
        $template->setValue('tenSV2', $sv2->hoTen ?? '');
        $template->setValue('mssv2', $sv2->mssv ?? '');
        $template->setValue('lop2', $sv2->lop ?? '');
        
        $path = storage_path('app/temp_pb_' . $topic->maDeTai . '.docx');
        $template->saveAs($path);
        return response()->download($path)->deleteFileAfterSend(true);
    }
}
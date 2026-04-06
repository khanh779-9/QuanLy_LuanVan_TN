<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ThesisForm;
use App\Models\Teacher;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ThesisFormController extends Controller
{
    private function ensureThuKy(Request $request)
    {
        $role = (string) $request->attributes->get('auth_role', '');
        if ($role !== 'ThuKy') {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập chức năng này.'
            ], 403);
        }

        return null;
    }

    public function index(Request $request)
    {
        if ($response = $this->ensureThuKy($request)) {
            return $response;
        }

        return response()->json([
            'data' => ThesisForm::all(),
        ]);
    }

    public function import(Request $request)
    {
        if ($response = $this->ensureThuKy($request)) {
            return $response;
        }

        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv',
        ]);

        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file->getRealPath());

        $sheet = $spreadsheet->getSheetByName('SVĐK theo link')
            ?? $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, true);

        if (count($rows) < 2) {
            return response()->json([
                'imported' => 0,
                'errors' => [['row' => 1, 'msg' => 'File không có dữ liệu.']],
            ], 422);
        }

        $headerRowIndex = null;
        $headerMap = [];
        foreach ($rows as $index => $row) {
            $normalized = array_map(function ($label) {
                $value = strtolower(trim((string) $label));
                $value = Str::ascii($value);
                $value = preg_replace('/[^a-z0-9]+/', '', $value);
                return $value;
            }, $row);

            if (in_array('mssv', $normalized, true) || in_array('masv', $normalized, true)) {
                $headerRowIndex = $index;
                foreach ($row as $col => $label) {
                    $key = strtolower(trim((string) $label));
                    $key = Str::ascii($key);
                    $key = preg_replace('/[^a-z0-9]+/', '', $key);

                    if (in_array($key, ['mssv', 'masv', 'masinhvien', 'masinhvien1'], true)) {
                        $headerMap['student1_id'] = $col;
                    } elseif (
                        in_array(
                            $key,
                            ['hotensinhvien', 'hovatensinhvien', 'hoten', 'hovatensinhvien1'],
                            true
                        )
                    ) {
                        $headerMap['student1_name'] = $col;
                    } elseif (in_array($key, ['lop', 'lopsinhvien1'], true)) {
                        $headerMap['student1_class'] = $col;
                    } elseif (in_array($key, ['email', 'emailaddress'], true)) {
                        $headerMap['student1_email'] = $col;
                    } elseif (in_array($key, ['sonhom', 'nhom', 'nhomsv'], true)) {
                        $headerMap['group_id'] = $col;
                    } elseif (in_array($key, ['nhom', 'nhomsv'], true)) {
                        $headerMap['topic_type'] = $col;
                    } elseif ($key === 'gvhd') {
                        $headerMap['gvhd_code'] = $col;
                    } elseif ($key === 'noicongtac') {
                        $headerMap['gvhd_workplace'] = $col;
                    } elseif ($key === 'tendetai') {
                        $headerMap['topic_title'] = $col;
                    } elseif (
                        in_array($key, ['noidungtomtatdetai', 'noidungtomtat'], true)
                    ) {
                        $headerMap['topic_description'] = $col;
                    } elseif ($key === 'ghichu') {
                        $headerMap['note'] = $col;
                    }
                }
                break;
            }
        }

        if ($headerRowIndex === null || !isset($headerMap['student1_id']) || !isset($headerMap['student1_name'])) {
            return response()->json([
                'imported' => 0,
                'errors' => [[
                    'row' => 1,
                    'msg' => 'Thiếu cột bắt buộc: MSSV hoặc Họ tên.',
                ]],
            ], 422);
        }

        $rows = array_slice($rows, $headerRowIndex + 1);
        $imported = 0;
        $errors = [];
        $groups = [];

        foreach ($rows as $index => $row) {
            $rowNumber = $headerRowIndex + $index + 2;
            $studentId = trim((string) ($row[$headerMap['student1_id']] ?? ''));
            $studentName = trim((string) ($row[$headerMap['student1_name']] ?? ''));

            if ($studentId === '' && $studentName === '') {
                continue;
            }

            $groupRaw = isset($headerMap['group_id'])
                ? trim((string) ($row[$headerMap['group_id']] ?? ''))
                : '';
            $groupKey = $groupRaw !== '' ? $groupRaw : 'row-' . $rowNumber;

            $groups[$groupKey][] = [
                'rowNumber' => $rowNumber,
                'row' => $row,
            ];
        }

        foreach ($groups as $groupKey => $groupRows) {
            if (count($groupRows) > 2) {
                $errors[] = [
                    'row' => $groupRows[0]['rowNumber'],
                    'msg' => 'Nhóm có hơn 2 sinh viên. Vui lòng kiểm tra lại.',
                ];
                continue;
            }

            $first = $groupRows[0];
            $row = $first['row'];

            $student1Id = trim((string) ($row[$headerMap['student1_id']] ?? ''));
            $student1Name = trim((string) ($row[$headerMap['student1_name']] ?? ''));
            $student1Class = isset($headerMap['student1_class'])
                ? trim((string) ($row[$headerMap['student1_class']] ?? ''))
                : '';
            $student1Email = isset($headerMap['student1_email'])
                ? trim((string) ($row[$headerMap['student1_email']] ?? ''))
                : null;

            if ($student1Id === '' || $student1Name === '' || $student1Class === '') {
                $errors[] = [
                    'row' => $first['rowNumber'],
                    'msg' => 'Thiếu MSSV, Họ tên hoặc Lớp.',
                ];
                continue;
            }

            $student2Id = null;
            $student2Name = null;
            $student2Class = null;
            $student2Email = null;

            if (count($groupRows) === 2) {
                $secondRow = $groupRows[1]['row'];
                $student2Id = trim((string) ($secondRow[$headerMap['student1_id']] ?? ''));
                $student2Name = trim((string) ($secondRow[$headerMap['student1_name']] ?? ''));
                $student2Class = isset($headerMap['student1_class'])
                    ? trim((string) ($secondRow[$headerMap['student1_class']] ?? ''))
                    : '';
                $student2Email = isset($headerMap['student1_email'])
                    ? trim((string) ($secondRow[$headerMap['student1_email']] ?? ''))
                    : null;
            }

            $topicTitle = isset($headerMap['topic_title'])
                ? trim((string) ($row[$headerMap['topic_title']] ?? ''))
                : '';
            if ($topicTitle === '') {
                $topicTitle = 'Chua cap nhat ten de tai';
            }

            $gvhdCode = isset($headerMap['gvhd_code'])
                ? trim((string) ($row[$headerMap['gvhd_code']] ?? ''))
                : null;
            if ($gvhdCode !== null && $gvhdCode !== '' && !Teacher::where('maGV', $gvhdCode)->exists()) {
                $gvhdCode = null;
            }

            ThesisForm::create([
                'topic_title' => $topicTitle,
                'topic_description' => isset($headerMap['topic_description'])
                    ? trim((string) ($row[$headerMap['topic_description']] ?? ''))
                    : null,
                'topic_type' => count($groupRows) === 2 ? 'hai_sinh_vien' : 'mot_sinh_vien',
                'student1_id' => $student1Id,
                'student1_name' => $student1Name,
                'student1_class' => $student1Class,
                'student1_email' => $student1Email ?: null,
                'student2_id' => $student2Id ?: null,
                'student2_name' => $student2Name ?: null,
                'student2_class' => $student2Class ?: null,
                'student2_email' => $student2Email ?: null,
                'gvhd_code' => $gvhdCode,
                'gvhd_workplace' => isset($headerMap['gvhd_workplace'])
                    ? trim((string) ($row[$headerMap['gvhd_workplace']] ?? ''))
                    : null,
                'note' => isset($headerMap['note'])
                    ? trim((string) ($row[$headerMap['note']] ?? ''))
                    : null,
                'source' => 'excel_import',
                'status' => 'cho_duyet',
            ]);
            $imported++;
        }

        return response()->json([
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'topic_title' => 'required|string|max:255',
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
            'gvhd_workplace' => 'nullable|string|max:255',
            'gvpb_code' => 'nullable|string|max:20',
            'note' => 'nullable|string',
            'source' => 'nullable|string|max:255',
            'status' => 'nullable|in:cho_duyet,da_duyet,tu_choi',
        ]);

        $thesisForm = ThesisForm::create($validatedData);

        return response()->json([
            'message' => 'Thesis form created successfully.',
            'data' => $thesisForm,
        ], 201);
    }

    public function show($id)
    {
        $thesisForm = ThesisForm::find($id);

        if (!$thesisForm) {
            return response()->json([
                'message' => 'Thesis form not found.',
            ], 404);
        }

        return response()->json([
            'data' => $thesisForm,
        ]);
    }

    public function update(Request $request, $id)
    {
        $thesisForm = ThesisForm::find($id);

        if (!$thesisForm) {
            return response()->json([
                'message' => 'Thesis form not found.',
            ], 404);
        }

        $validatedData = $request->validate([
            'topic_title' => 'sometimes|required|string|max:255',
            'topic_description' => 'sometimes|nullable|string',
            'topic_type' => 'sometimes|required|in:mot_sinh_vien,hai_sinh_vien',
            'student1_id' => 'sometimes|required|string|max:20',
            'student1_name' => 'sometimes|required|string|max:255',
            'student1_class' => 'sometimes|required|string|max:50',
            'student1_email' => 'sometimes|nullable|email|max:255',
            'student2_id' => 'nullable|string|max:20',
            'student2_name' => 'nullable|string|max:255',
            'student2_class' => 'nullable|string|max:50',
            'student2_email' => 'nullable|email|max:255',
            'gvhd_code' => 'sometimes|nullable|string|max:20',
            'gvhd_workplace' => 'sometimes|nullable|string|max:255',
            'gvpb_code' => 'sometimes|nullable|string|max:20',
            'note' => 'nullable|string',
            'source' => 'nullable|string|max:255',
            'status' => 'sometimes|nullable|in:cho_duyet,da_duyet,tu_choi',
        ]);

        $thesisForm->update($validatedData);

        return response()->json([
            'message' => 'Thesis form updated successfully.',
            'data' => $thesisForm,
        ]);
    }

    public function destroy($id)
    {
        $thesisForm = ThesisForm::find($id);

        if (!$thesisForm) {
            return response()->json([
                'message' => 'Thesis form not found.',
            ], 404);
        }

        $thesisForm->delete();

        return response()->json([
            'message' => 'Thesis form deleted successfully.',
        ]);
    }

    public function destroyAll()
    {
        ThesisForm::truncate();

        return response()->json([
            'message' => 'All thesis forms deleted successfully.',
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\SinhVien;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;

class SinhVienController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
        ]);

        $spreadsheet = IOFactory::load($request->file('file')->getPathname());
        $rows = $spreadsheet->getActiveSheet()->toArray();

        $imported = 0;
        $errors = [];

        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i];
            $mssv = trim($row[0] ?? '');
            $hoTen = trim($row[1] ?? '');
            $lop = trim($row[2] ?? '');
            $email = trim($row[3] ?? '');

            if ($mssv === '' || $hoTen === '') {
                $errors[] = ['row' => $i + 1, 'message' => 'Thieu MSSV hoac Ho ten'];
                continue;
            }

            if (SinhVien::where('mssv', $mssv)->exists()) {
                $errors[] = ['row' => $i + 1, 'message' => "MSSV $mssv da ton tai"];
                continue;
            }

            SinhVien::create([
                'mssv' => $mssv,
                'hoTen' => $hoTen,
                'lop' => $lop ?: null,
                'email' => $email ?: null,
            ]);
            $imported++;
        }

        return response()->json([
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }

    public function index(Request $request)
    {
        $query = SinhVien::query();

        if ($request->filled('lop')) {
            $query->where('lop', $request->lop);
        }

        if ($request->filled('gvhd_id')) {
            $query->whereHas('deTai', function ($q) use ($request) {
                $q->where('maGV_HD', $request->gvhd_id);
            });
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('mssv', 'like', "%$s%")
                  ->orWhere('hoTen', 'like', "%$s%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $request->validate([
            'mssv' => 'required|unique:sinhvien,mssv',
            'hoTen' => 'required',
            'email' => 'nullable|email|unique:sinhvien,email',
            'lop' => 'nullable',
            'soDienThoai' => 'nullable',
            'maDeTai' => 'nullable|exists:detai,maDeTai',
        ]);
        $sv = SinhVien::create([
            'mssv' => $request->mssv,
            'hoTen' => $request->hoTen,
            'email' => $request->email,
            'lop' => $request->lop,
            'soDienThoai' => $request->soDienThoai,
            'maDeTai' => $request->maDeTai,
        ]);

        return response()->json(['data' => $sv], 201);
    }

    public function update(Request $request, $mssv)
    {
        $sv = SinhVien::where('mssv', $mssv)->first();
        if (!$sv) {
            return response()->json(['message' => 'Khong tim thay sinh vien'], 404);
        }

        $request->validate([
            'hoTen' => 'required',
            'email' => 'nullable|email|unique:sinhvien,email,' . $mssv . ',mssv',
            'lop' => 'nullable',
            'soDienThoai' => 'nullable',
            'maDeTai' => 'nullable|exists:detai,maDeTai',
        ]);
        $sv->update([
            'hoTen' => $request->hoTen,
            'email' => $request->email,
            'lop' => $request->lop,
            'soDienThoai' => $request->soDienThoai,
            'maDeTai' => $request->maDeTai,
        ]);

        return response()->json(['data' => $sv]);
    }

    public function lopList(Request $request)
    {
        $query = SinhVien::whereNotNull('lop')->where('lop', '!=', '');

        $lops = $query->distinct()->pluck('lop')->sort()->values();
        return response()->json($lops);
    }

    public function destroy($mssv)
    {
        $sv = SinhVien::where('mssv', $mssv)->first();
        if (!$sv) {
            return response()->json(['message' => 'Khong tim thay sinh vien'], 404);
        }

        if ($sv->maDeTai) {
            return response()->json(['message' => 'Khong the xoa sinh vien da co de tai'], 422);
        }

        $sv->delete();
        return response()->json(['message' => 'ok']);
    }
}

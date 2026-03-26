<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Teacher;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class LecturerController extends Controller
{
    // API: GET /lecturers
    public function index()
    {
        return response()->json([
            'data' => Teacher::orderBy('maGV', 'desc')->get(),
        ]);
    }

    // API: GET /lecturers/{lecturer}
    public function show(Teacher $lecturer)
    {
        return response()->json([
            'data' => $lecturer,
        ]);
    }

    // API: POST /lecturers
    public function store(Request $request)
    {
        $validated = $request->validate([
            'maGV' => 'required|string|max:20|unique:giangvien,maGV',
            'tenGV' => 'required|string|max:100',
            'email' => 'nullable|email|max:100|unique:giangvien,email',
            'soDienThoai' => 'nullable|string|max:15',
            'hocVi' => 'nullable|string|max:50',
            'matKhau' => 'required|string|min:3',
        ]);
        $validated['matKhau'] = Hash::make($validated['matKhau']);
        $lecturer = Teacher::create($validated);
        return response()->json([
            'data' => $lecturer,
        ], 201);
    }

    // API: PUT /lecturers/{lecturer}
    public function update(Request $request, Teacher $lecturer)
    {
        $validated = $request->validate([
            'maGV' => ['required', 'string', 'max:20', Rule::unique('giangvien', 'maGV')->ignore($lecturer->maGV, 'maGV')],
            'tenGV' => 'required|string|max:100',
            'email' => ['nullable', 'email', 'max:100', Rule::unique('giangvien', 'email')->ignore($lecturer->maGV, 'maGV')],
            'soDienThoai' => 'nullable|string|max:15',
            'hocVi' => 'nullable|string|max:50',
            'matKhau' => 'nullable|string|min:3',
        ]);
        if (!empty($validated['matKhau'])) {
            $validated['matKhau'] = Hash::make($validated['matKhau']);
        } else {
            unset($validated['matKhau']);
        }
        $lecturer->update($validated);
        return response()->json([
            'data' => $lecturer,
        ]);
    }

    // API: DELETE /lecturers/{lecturer}
    public function destroy(Teacher $lecturer)
    {
        $lecturer->delete();
        return response()->json([
            'message' => 'Đã xóa giảng viên',
        ]);
    }
}

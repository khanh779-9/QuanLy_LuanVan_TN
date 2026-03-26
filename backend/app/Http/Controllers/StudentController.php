<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;

class StudentController extends Controller
{

    // API: GET /students
    public function index(Request $request)
    {
        $query = Student::with('topic')->orderBy('mssv', 'desc');
        if ($request->filled('q')) {
            $search = $request->string('q')->toString();
            $query->where(function ($builder) use ($search) {
                $builder->where('mssv', 'like', "%{$search}%")
                    ->orWhere('hoTen', 'like', "%{$search}%")
                    ->orWhere('lop', 'like', "%{$search}%");
            });
        }
        return response()->json(['data' => $query->get()]);
    }

    // API: GET /students/{student}
    public function show(Student $student)
    {
        return response()->json(['data' => $student->load('topic')]);
    }

    // API: POST /students
    public function store(Request $request)
    {
        $validated = $request->validate([
            'mssv' => 'required|string|max:20|unique:sinhvien,mssv',
            'hoTen' => 'required|string|max:100',
            'lop' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'soDienThoai' => 'nullable|string|max:15',
            'maDeTai' => 'nullable|exists:detai,maDeTai',
        ]);
        $student = Student::create($validated);
        return response()->json(['data' => $student], 201);
    }

    // API: PUT /students/{student}
    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'mssv' => ['required', 'string', 'max:20', \Illuminate\Validation\Rule::unique('sinhvien', 'mssv')->ignore($student->mssv, 'mssv')],
            'hoTen' => 'required|string|max:100',
            'lop' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'soDienThoai' => 'nullable|string|max:15',
            'maDeTai' => 'nullable|exists:detai,maDeTai',
        ]);
        $student->update($validated);
        return response()->json(['data' => $student]);
    }

    // API: DELETE /students/{student}
    public function destroy(Student $student)
    {
        $student->delete();
        return response()->json(['message' => 'Đã xóa sinh viên']);
    }

    // API: DELETE /students (xóa tất cả)
    public function destroyAll()
    {
        Student::truncate();
        return response()->json(['message' => 'Đã xóa tất cả sinh viên']);
    }
}

    

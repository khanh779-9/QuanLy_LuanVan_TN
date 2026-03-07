<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::with('topic')->paginate(20);
        return view('students.index', compact('students'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'mssv' => 'required|unique:students',
            'name' => 'required',
            'class' => 'required',
        ]);

        Student::create($request->all());
        return back()->with('success', 'Thêm sinh viên thành công');
    }

    public function update(Request $request, Student $student)
    {
        $request->validate([
            'mssv' => 'required|unique:students,mssv,' . $student->id,
            'name' => 'required',
        ]);

        $student->update($request->all());
        return back()->with('success', 'Cập nhật sinh viên thành công');
    }

    public function destroy(Student $student)
    {
        $student->delete();
        return back()->with('success', 'Xóa sinh viên thành công');
    }

    public function destroyAll()
    {
        Student::truncate();
        return back()->with('success', 'Đã xóa tất cả sinh viên');
    }
}

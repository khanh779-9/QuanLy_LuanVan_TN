<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class LecturerController extends Controller
{
    public function index()
    {
        $lecturers = User::where('role', 'lecturer')->paginate(20);
        return view('lecturers.index', compact('lecturers'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'maGV' => 'required|unique:users',
            'tenGV' => 'required',
            'email' => 'required|email|unique:users',
            'matKhau' => 'required|min:3',
        ]);

        User::create([
            'maGV' => $request->maGV,
            'tenGV' => $request->tenGV,
            'email' => $request->email,
            'soDienThoai' => $request->soDienThoai,
            'hocVi' => $request->hocVi,
            'matKhau' => $request->matKhau, // Plaintext password
            'role' => 'lecturer',
        ]);

        return back()->with('success', 'Thêm giảng viên thành công');
    }

    public function update(Request $request, User $lecturer)
    {
        $request->validate([
            'maGV' => 'required|unique:users,maGV,' . $lecturer->id,
            'tenGV' => 'required',
            'email' => 'required|email|unique:users,email,' . $lecturer->id,
            'soDienThoai' => 'nullable',
            'hocVi' => 'nullable',
        ]);

        $data = $request->except('matKhau');
        if ($request->filled('matKhau')) {
            $data['matKhau'] = Hash::make($request->matKhau);
        }

        $lecturer->update($data);
        return back()->with('success', 'Cập nhật giảng viên thành công');
    }

    public function destroy(User $lecturer)
    {
        $lecturer->delete();
        return back()->with('success', 'Xóa giảng viên thành công');
    }
}

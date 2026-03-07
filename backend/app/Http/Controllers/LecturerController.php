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
            'username' => 'required|unique:users',
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:3',
        ]);

        User::create([
            'username' => $request->username,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'degree' => $request->degree,
            'password' => $request->password, // Plaintext password
            'role' => 'lecturer',
        ]);

        return back()->with('success', 'Thêm giảng viên thành công');
    }

    public function update(Request $request, User $lecturer)
    {
        $request->validate([
            'username' => 'required|unique:users,username,' . $lecturer->id,
            'name' => 'required',
            'email' => 'required|email|unique:users,email,' . $lecturer->id,
        ]);

        $data = $request->except('password');
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
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

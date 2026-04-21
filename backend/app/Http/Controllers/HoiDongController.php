<?php

namespace App\Http\Controllers;

use App\Models\HoiDong;
use Illuminate\Http\Request;

class HoiDongController extends Controller
{
    // Lấy danh sách tất cả hội đồng
    public function index()
    {
        return response()->json(HoiDong::all());
    }

    // Lấy thông tin một hội đồng theo ID
    public function show($id)
    {
        $hoidong = HoiDong::find($id);
        if (!$hoidong) {
            return response()->json(['message' => 'Không tìm thấy hội đồng'], 404);
        }
        return response()->json($hoidong);
    }

    // Tạo mới hội đồng
    public function store(Request $request)
    {
        $data = $request->validate([
            'tenHoiDong' => 'required|string',
            'diaDiem' => 'nullable|string',
            'ngayBaoVe' => 'nullable|date',
        ]);
        $hoidong = HoiDong::create($data);
        return response()->json($hoidong, 201);
    }

    // Cập nhật hội đồng
    public function update(Request $request, $id)
    {
        $hoidong = HoiDong::find($id);
        if (!$hoidong) {
            return response()->json(['message' => 'Không tìm thấy hội đồng'], 404);
        }
        $data = $request->validate([
            'tenHoiDong' => 'sometimes|required|string',
            'diaDiem' => 'nullable|string',
            'ngayBaoVe' => 'nullable|date',
        ]);
        $hoidong->update($data);
        return response()->json($hoidong);
    }

    // Xóa hội đồng
    public function destroy($id)
    {
        $hoidong = HoiDong::find($id);
        if (!$hoidong) {
            return response()->json(['message' => 'Không tìm thấy hội đồng'], 404);
        }
        $hoidong->delete();
        return response()->json(['message' => 'Đã xóa hội đồng']);
    }
}

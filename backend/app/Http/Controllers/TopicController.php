<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Topic;
use App\Models\Student;
use App\Models\User;
use App\Http\Requests\StoreTopicRequest;
use App\Http\Requests\UpdateTopicRequest;

class TopicController extends Controller
{
    // 1. LẤY DANH SÁCH (Đã chuyển sang JSON)
    public function index(Request $request)
    {
        $user = Auth::user();

        $topics = Topic::with(['lecturer', 'reviewer', 'council', 'students'])
            ->forUser($user)
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $topics,
            'meta' => [
                'lecturers' => User::where('role', 'lecturer')->orderBy('tenGV')->get(),
                'freeStudents' => Student::whereNull('maDeTai')->orderBy('hoTen')->get(),
                'mode' => $request->get('type', 'HD')
            ]
        ], 200);
    }

    // 2. THÊM ĐỀ TÀI & TẠO NHÓM
    public function store(StoreTopicRequest $request)
    {
        // Logic "Create Group" (Phân công GV):
        if ($request->has('student_1')) {
            $topic = Topic::create([
                'tenDeTai' => 'Chưa cập nhật tên đề tài',
                'maGV_HD' => $request->lecturer_id,
                'trangThaiGiuaKy' => 'Được làm tiếp',
            ]);

            // Gán sinh viên vào đề tài
            Student::where('mssv', $request->student_1)->update(['maDeTai' => $topic->maDeTai]);
            if ($request->has('student_2') && $request->student_2) {
                Student::where('mssv', $request->student_2)->update(['maDeTai' => $topic->maDeTai]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Tạo nhóm và phân công thành công',
                'data' => $topic
            ], 201);
        }

        // Standard Store
        $topic = Topic::create($request->validated());
        return response()->json([
            'success' => true, 
            'message' => 'Thêm đề tài thành công',
            'data' => $topic
        ], 201);
    }

    // 3. SỬA ĐỀ TÀI
    public function update(UpdateTopicRequest $request, Topic $topic)
    {
        $topic->update($request->validated());
        return response()->json([
            'success' => true, 
            'message' => 'Cập nhật đề tài thành công',
            'data' => $topic
        ], 200);
    }

    // 4. XÓA ĐỀ TÀI
    public function destroy(Topic $topic)
    {
        // Gỡ sinh viên ra khỏi đề tài
        Student::where('maDeTai', $topic->maDeTai)->update(['maDeTai' => null]);
        $topic->delete();
        return response()->json([
            'success' => true,
            'message' => 'Xóa đề tài thành công'
        ], 200);
    }

    // 5. CHỨC NĂNG DUYỆT / TỪ CHỐI ĐỀ TÀI
    public function updateStatus(Request $request, Topic $topic)
    {
        $request->validate([
            'status' => 'required|string'
        ]);

        // Cập nhật đúng vào cột trạng thái tiếng Việt
        $topic->update([
            'trangThaiGiuaKy' => $request->status 
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái duyệt thành công!',
            'data' => $topic
        ], 200);
    }
}
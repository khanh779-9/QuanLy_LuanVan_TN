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
    public function index(Request $request)
    {
        $user = Auth::user();

        $topics = Topic::with(['lecturer', 'reviewer', 'council', 'students'])
            ->forUser($user)
            ->orderBy('code')
            ->paginate(20);

        // Data for Modals (Admin only usually, but passed anyway)
        $lecturers = User::where('role', 'lecturer')->orderBy('name')->get();
        $freeStudents = Student::whereNull('topic_id')->orderBy('name')->get();
        $mode = $request->get('type', 'HD'); // HD or PB

        return view('topics.index', compact('topics', 'lecturers', 'freeStudents', 'mode'));
    }

    public function store(StoreTopicRequest $request)
    {
        // Validated data is available via $request->validated()

        // Logic for "Create Group" (Phân công GV):
        if ($request->has('student_1')) {
            $topic = Topic::create([
                'name' => 'Chưa cập nhật tên đề tài',
                'code' => $request->code,
                'lecturer_id' => $request->lecturer_id,
                'midterm_status' => 'Được làm tiếp',
            ]);

            // Assign students
            Student::where('id', $request->student_1)->update(['topic_id' => $topic->id]);
            if ($request->has('student_2') && $request->student_2) {
                Student::where('id', $request->student_2)->update(['topic_id' => $topic->id]);
            }

            return back()->with('success', 'Tạo nhóm thành công');
        }

        // Standard Store
        Topic::create($request->validated());
        return back()->with('success', 'Thêm đề tài thành công');
    }

    public function update(UpdateTopicRequest $request, Topic $topic)
    {
        $topic->update($request->validated());
        return back()->with('success', 'Cập nhật đề tài thành công');
    }

    public function destroy(Topic $topic)
    {
        // Unassign students first
        Student::where('topic_id', $topic->id)->update(['topic_id' => null]);
        $topic->delete();
        return back()->with('success', 'Xóa đề tài thành công');
    }
}

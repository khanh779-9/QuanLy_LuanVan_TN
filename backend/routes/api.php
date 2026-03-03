<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Setting;
use App\Models\Student;
use App\Models\Topic;
use App\Models\Council;
use Illuminate\Validation\Rule;

Route::get('/', function () {
    return response()->json([
        'message' => 'Backend API is running',
    ]);
});

Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'username' => 'required',
        'password' => 'required',
    ]);

    $user = User::where('username', $credentials['username'])->first();

    if (!$user || $user->password !== $credentials['password']) {
        return response()->json([
            'message' => 'Thông tin đăng nhập không chính xác.',
        ], 401);
    }

    return response()->json([
        'message' => 'Đăng nhập thành công.',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'role' => $user->role,
        ],
    ]);
});

Route::get('/dashboard', function () {
    $setting = Setting::firstOrCreate([], ['stage' => 1]);

    return response()->json([
        'stage' => $setting->stage,
        'stats' => [
            'students' => Student::count(),
            'topics' => Topic::count(),
            'councils' => Council::count(),
        ],
    ]);
});

Route::get('/students', function (Request $request) {
    $query = Student::with('topic')->orderBy('id', 'desc');
    if ($request->filled('q')) {
        $search = $request->string('q')->toString();
        $query->where(function ($builder) use ($search) {
            $builder->where('mssv', 'like', "%{$search}%")
                ->orWhere('name', 'like', "%{$search}%")
                ->orWhere('class', 'like', "%{$search}%");
        });
    }

    return response()->json([
        'data' => $query->get(),
    ]);
});

Route::post('/students', function (Request $request) {
    $validated = $request->validate([
        'mssv' => 'required|unique:students,mssv',
        'name' => 'required',
        'class' => 'required',
        'email' => 'nullable|email',
        'phone' => 'nullable',
    ]);

    $student = Student::create($validated);
    return response()->json(['data' => $student], 201);
});

Route::put('/students/{student}', function (Request $request, Student $student) {
    $validated = $request->validate([
        'mssv' => ['required', Rule::unique('students', 'mssv')->ignore($student->id)],
        'name' => 'required',
        'class' => 'required',
        'email' => 'nullable|email',
        'phone' => 'nullable',
    ]);

    $student->update($validated);
    return response()->json(['data' => $student]);
});

Route::delete('/students/{student}', function (Student $student) {
    $student->delete();
    return response()->json(['message' => 'Đã xóa sinh viên']);
});

Route::delete('/students', function () {
    Student::truncate();
    return response()->json(['message' => 'Đã xóa tất cả sinh viên']);
});

Route::get('/lecturers', function () {
    return response()->json([
        'data' => User::where('role', 'lecturer')->orderBy('id', 'desc')->get(),
    ]);
});

Route::post('/lecturers', function (Request $request) {
    $validated = $request->validate([
        'username' => 'required|unique:users,username',
        'name' => 'required',
        'email' => 'required|email|unique:users,email',
        'phone' => 'nullable',
        'degree' => 'nullable',
        'password' => 'required|min:3',
    ]);

    $lecturer = User::create([
        ...$validated,
        'role' => 'lecturer',
    ]);

    return response()->json(['data' => $lecturer], 201);
});

Route::put('/lecturers/{lecturer}', function (Request $request, User $lecturer) {
    $validated = $request->validate([
        'username' => ['required', Rule::unique('users', 'username')->ignore($lecturer->id)],
        'name' => 'required',
        'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($lecturer->id)],
        'phone' => 'nullable',
        'degree' => 'nullable',
        'password' => 'nullable|min:3',
    ]);

    if (empty($validated['password'])) {
        unset($validated['password']);
    }

    $lecturer->update($validated);
    return response()->json(['data' => $lecturer]);
});

Route::delete('/lecturers/{lecturer}', function (User $lecturer) {
    $lecturer->delete();
    return response()->json(['message' => 'Đã xóa giảng viên']);
});

Route::get('/councils', function () {
    return response()->json([
        'data' => Council::with('members')->orderBy('id', 'desc')->get(),
    ]);
});

Route::post('/councils', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required',
        'location' => 'required',
    ]);

    $council = Council::create($validated);
    return response()->json(['data' => $council], 201);
});

Route::put('/councils/{council}', function (Request $request, Council $council) {
    $validated = $request->validate([
        'name' => 'required',
        'location' => 'required',
    ]);

    $council->update($validated);
    return response()->json(['data' => $council]);
});

Route::delete('/councils/{council}', function (Council $council) {
    $council->delete();
    return response()->json(['message' => 'Đã xóa hội đồng']);
});

Route::get('/topics', function (Request $request) {
    $query = Topic::with(['lecturer', 'reviewer', 'council', 'students'])->orderBy('id', 'desc');
    if ($request->filled('type') && $request->string('type')->toString() === 'PB') {
        $query->whereNotNull('reviewer_id');
    }
    return response()->json([
        'data' => $query->get(),
    ]);
});

Route::post('/topics', function (Request $request) {
    $validated = $request->validate([
        'code' => 'required|string|max:20|unique:topics,code',
        'name' => 'nullable|string|max:255',
        'subject_name' => 'nullable|string|max:255',
        'lecturer_id' => 'nullable|exists:users,id',
        'reviewer_id' => 'nullable|exists:users,id',
        'student_1' => 'nullable|exists:students,id',
        'student_2' => 'nullable|exists:students,id|different:student_1',
    ]);

    $topic = Topic::create([
        'code' => $validated['code'],
        'name' => $validated['name'] ?? 'Chưa cập nhật tên đề tài',
        'subject_name' => $validated['subject_name'] ?? null,
        'lecturer_id' => $validated['lecturer_id'] ?? null,
        'reviewer_id' => $validated['reviewer_id'] ?? null,
        'midterm_status' => 'Được làm tiếp',
    ]);

    if (!empty($validated['student_1'])) {
        Student::where('id', $validated['student_1'])->update(['topic_id' => $topic->id]);
    }
    if (!empty($validated['student_2'])) {
        Student::where('id', $validated['student_2'])->update(['topic_id' => $topic->id]);
    }

    return response()->json(['data' => $topic->load(['lecturer', 'reviewer', 'students'])], 201);
});

Route::put('/topics/{topic}', function (Request $request, Topic $topic) {
    $validated = $request->validate([
        'name' => 'nullable|string|max:255',
        'subject_name' => 'nullable|string|max:255',
        'lecturer_id' => 'nullable|exists:users,id',
        'reviewer_id' => 'nullable|exists:users,id',
        'midterm_score' => 'nullable|numeric|min:0|max:10',
        'advisor_score' => 'nullable|numeric|min:0|max:10',
        'defense_score' => 'nullable|numeric|min:0|max:10',
    ]);

    $topic->update($validated);
    return response()->json(['data' => $topic->load(['lecturer', 'reviewer', 'students'])]);
});

Route::delete('/topics/{topic}', function (Topic $topic) {
    Student::where('topic_id', $topic->id)->update(['topic_id' => null]);
    $topic->delete();
    return response()->json(['message' => 'Đã xóa đề tài']);
});

Route::get('/options', function () {
    return response()->json([
        'lecturers' => User::where('role', 'lecturer')->orderBy('name')->get(['id', 'name']),
        'students' => Student::whereNull('topic_id')->orderBy('name')->get(['id', 'name', 'mssv']),
    ]);
});

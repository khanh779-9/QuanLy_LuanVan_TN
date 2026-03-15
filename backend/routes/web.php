<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;
use Illuminate\Http\Request;

Route::get('/', function () {
    return response()->json([
        'message' => 'Backend is running',
        'api' => url('/api'),
        'health' => url('/up'),
        'users' => url('/users'),
    ]);
});

Route::get('/users', function () {
    return response()->json([
        'data' => User::orderBy('id', 'asc')->get(),
    ]);
});

Route::get('/users/{id}', function (int $id) {
    $user = User::find($id);

    if (!$user) {
        return response()->json([
            'message' => 'Không tìm thấy người dùng.',
        ], 404);
    }

    return response()->json([
        'data' => $user,
    ]);
});

Route::post('/users', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:50',
        'email' => 'nullable|email|max:100|unique:users,email',
    ]);

    $user = User::create($validated);

    return response()->json([
        'data' => $user,
    ], 201);
});

Route::put('/users/{id}', function (Request $request, int $id) {
    $user = User::find($id);

    if (!$user) {
        return response()->json([
            'message' => 'Không tìm thấy người dùng.',
        ], 404);
    }

    $validated = $request->validate([
        'name' => 'required|string|max:50',
        'email' => ['nullable', 'email', 'max:100', \Illuminate\Validation\Rule::unique('users', 'email')->ignore($id, 'id')],
    ]);

    $user->update($validated);

    return response()->json([
        'data' => $user,
    ]);
});

Route::delete('/users/{id}', function (int $id) {
    $user = User::find($id);

    if (!$user) {
        return response()->json([
            'message' => 'Không tìm thấy người dùng.',
        ], 404);
    }

    $user->delete();

    return response()->json([
        'message' => 'Đã xóa người dùng.',
    ]);
});

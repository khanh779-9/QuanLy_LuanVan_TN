<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Setting;
use App\Models\Student;
use App\Models\Topic;
use App\Models\Council;

class DashboardController extends Controller
{
    public function index()
    {
        $setting = Setting::firstOrCreate([], ['giaiDoan' => 1]);
        $giaiDoan = $setting->giaiDoan;

        $stats = [
            'students' => 0,
            'topics' => 0,
            'councils' => 0
        ];

        if (Auth::user()->role === 'admin') {
            $stats['students'] = Student::count();
            $stats['topics'] = Topic::count();
            $stats['councils'] = Council::count();
        }

        return view('dashboard', compact('giaiDoan', 'stats'));
    }

    public function updateStage(Request $request)
    {
        $setting = Setting::first();
        if ($request->has('next_stage')) {
            $setting->increment('giaiDoan');
        } elseif ($request->has('reset_stage')) {
            $setting->update(['giaiDoan' => 1]);
        }
        return back()->with('success', 'Cập nhật giai đoạn thành công!');
    }
}

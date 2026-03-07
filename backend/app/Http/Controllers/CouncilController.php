<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Council;

class CouncilController extends Controller
{
    public function index()
    {
        $councils = Council::with('members')->paginate(20);
        return view('councils.index', compact('councils'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'location' => 'required',
            'members' => 'array', // [user_id => role]
        ]);

        $council = Council::create($request->only('name', 'location'));

        if ($request->has('members')) {
            // Logic to attach members
            // members input format: [user_id, role] or similar.
            // Simplified for now, assuming logic handles array of IDs + roles
        }

        return back()->with('success', 'Thêm hội đồng thành công');
    }

    public function update(Request $request, Council $council)
    {
        $council->update($request->only('name', 'location'));
        return back()->with('success', 'Cập nhật hội đồng thành công');
    }

    public function destroy(Council $council)
    {
        $council->delete();
        return back()->with('success', 'Xóa hội đồng thành công');
    }
}

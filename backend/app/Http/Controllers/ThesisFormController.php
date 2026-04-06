<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ThesisForm;

class ThesisFormController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => ThesisForm::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'topic_title' => 'required|string|max:255',
            'topic_description' => 'nullable|string',
            'topic_type' => 'required|in:mot_sinh_vien,hai_sinh_vien',
            'student1_id' => 'required|string|max:20',
            'student1_name' => 'required|string|max:255',
            'student1_class' => 'required|string|max:50',
            'student1_email' => 'nullable|email|max:255',
            'student2_id' => 'nullable|string|max:20',
            'student2_name' => 'nullable|string|max:255',
            'student2_class' => 'nullable|string|max:50',
            'student2_email' => 'nullable|email|max:255',
            'gvhd_code' => 'nullable|string|max:20',
            'gvhd_workplace' => 'nullable|string|max:255',
            'gvpb_code' => 'nullable|string|max:20',
            'note' => 'nullable|string',
            'source' => 'nullable|string|max:255',
            'status' => 'nullable|in:cho_duyet,da_duyet,tu_choi',
        ]);

        $thesisForm = ThesisForm::create($validatedData);

        return response()->json([
            'message' => 'Thesis form created successfully.',
            'data' => $thesisForm,
        ], 201);
    }

    public function show($id)
    {
        $thesisForm = ThesisForm::find($id);

        if (!$thesisForm) {
            return response()->json([
                'message' => 'Thesis form not found.',
            ], 404);
        }

        return response()->json([
            'data' => $thesisForm,
        ]);
    }

    public function update(Request $request, $id)
    {
        $thesisForm = ThesisForm::find($id);

        if (!$thesisForm) {
            return response()->json([
                'message' => 'Thesis form not found.',
            ], 404);
        }

        $validatedData = $request->validate([
            'topic_title' => 'sometimes|required|string|max:255',
            'topic_description' => 'sometimes|nullable|string',
            'topic_type' => 'sometimes|required|in:mot_sinh_vien,hai_sinh_vien',
            'student1_id' => 'sometimes|required|string|max:20',
            'student1_name' => 'sometimes|required|string|max:255',
            'student1_class' => 'sometimes|required|string|max:50',
            'student1_email' => 'sometimes|nullable|email|max:255',
            'student2_id' => 'nullable|string|max:20',
            'student2_name' => 'nullable|string|max:255',
            'student2_class' => 'nullable|string|max:50',
            'student2_email' => 'nullable|email|max:255',
            'gvhd_code' => 'sometimes|nullable|string|max:20',
            'gvhd_workplace' => 'sometimes|nullable|string|max:255',
            'gvpb_code' => 'sometimes|nullable|string|max:20',
            'note' => 'nullable|string',
            'source' => 'nullable|string|max:255',
            'status' => 'sometimes|nullable|in:cho_duyet,da_duyet,tu_choi',
        ]);

        $thesisForm->update($validatedData);

        return response()->json([
            'message' => 'Thesis form updated successfully.',
            'data' => $thesisForm,
        ]);
    }

    public function destroy($id)
    {
        $thesisForm = ThesisForm::find($id);

        if (!$thesisForm) {
            return response()->json([
                'message' => 'Thesis form not found.',
            ], 404);
        }

        $thesisForm->delete();

        return response()->json([
            'message' => 'Thesis form deleted successfully.',
        ]);
    }

    public function destroyAll()
    {
        ThesisForm::truncate();

        return response()->json([
            'message' => 'All thesis forms deleted successfully.',
        ]);
    }
}

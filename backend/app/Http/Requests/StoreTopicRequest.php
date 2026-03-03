<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTopicRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Check context: "Create Group" vs "Standard"
        if ($this->has('student_1')) {
            return [
                'student_1' => 'required|exists:students,id',
                'lecturer_id' => 'required|exists:users,id',
                'code' => 'required|string|max:20|unique:topics,code',
                'student_2' => 'nullable|exists:students,id|different:student_1',
            ];
        }

        return [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:20|unique:topics,code',
            // Add other standard fields as needed
        ];
    }
}

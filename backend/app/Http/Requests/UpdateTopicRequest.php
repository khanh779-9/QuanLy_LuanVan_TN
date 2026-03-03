<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTopicRequest extends FormRequest
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
        return [
            'name' => 'sometimes|string|max:255',
            'midterm_score' => 'nullable|numeric|min:0|max:10',
            'advisor_score' => 'nullable|numeric|min:0|max:10',
            'defense_score' => 'nullable|numeric|min:0|max:10',
            'midterm_status' => 'nullable|string',
            // Add other fields being updated
        ];
    }
}

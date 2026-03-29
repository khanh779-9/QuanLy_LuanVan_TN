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
}

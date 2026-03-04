<?php

use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Backend is running',
        'api' => url('/api'),
        'health' => url('/up'),
    ]);
})->withoutMiddleware([StartSession::class]);

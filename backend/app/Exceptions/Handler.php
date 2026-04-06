<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class Handler extends ExceptionHandler
{
    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $exception)
    {
        // Nếu là request API hoặc muốn JSON, trả về JSON
        if ($request->expectsJson() || $request->is('api/*')) {
            $status = method_exists($exception, 'getStatusCode') ? $exception->getCode() : 500;
            $message = $exception->getMessage();
            $response = [
                'message' => $message,
            ];
            // Nếu là lỗi validation
            if (method_exists($exception, 'errors')) {
                $response['errors'] = $exception->getMessage();
            }
            return response()->json($response, $status);
        }
        // Mặc định: dùng render gốc
        return parent::render($request, $exception);
    }
}

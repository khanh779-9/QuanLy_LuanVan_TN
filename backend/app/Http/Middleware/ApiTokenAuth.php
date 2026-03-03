<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' => 'Thiếu Bearer token.',
            ], 401);
        }

        $userId = Cache::get('api_token:' . $token);

        if (!$userId) {
            return response()->json([
                'message' => 'Token không hợp lệ hoặc đã hết hạn.',
            ], 401);
        }

        $user = User::find($userId);

        if (!$user) {
            Cache::forget('api_token:' . $token);

            return response()->json([
                'message' => 'Người dùng không tồn tại.',
            ], 401);
        }

        $request->attributes->set('auth_user', $user);
        $request->attributes->set('api_token', $token);

        return $next($request);
    }
}

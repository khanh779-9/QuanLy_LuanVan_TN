<?php

namespace App\Http\Middleware;

use App\Models\Teacher;
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

        $tokenStore = Cache::store('file');
        $payload = $tokenStore->get('api_token:' . $token);

        if (!$payload) {
            return response()->json([
                'message' => 'Token không hợp lệ hoặc đã hết hạn.',
            ], 401);
        }

        $role = 'lecturer';
        $user = null;

        if (is_array($payload)) {
            $role = (string) ($payload['role'] ?? 'lecturer');

            if ($role === 'admin') {
                $user = (object) [
                    'maGV' => 'admin',
                    'tenGV' => 'Admin',
                    'email' => null,
                    'soDienThoai' => null,
                    'hocVi' => null,
                ];
            } else {
                $maGV = (string) ($payload['maGV'] ?? '');
                if ($maGV !== '') {
                    $user = Teacher::where('maGV', $maGV)->first();
                }
            }
        } else {
            $maGV = (string) $payload;
            $user = Teacher::where('maGV', $maGV)->first();
        }

        if (!$user) {
            $tokenStore->forget('api_token:' . $token);

            return response()->json([
                'message' => 'Người dùng không tồn tại.',
            ], 401);
        }

        $request->attributes->set('auth_user', $user);
        $request->attributes->set('auth_role', $role);
        $request->attributes->set('api_token', $token);

        return $next($request);
    }
}

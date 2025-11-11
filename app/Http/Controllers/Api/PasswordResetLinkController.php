<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PasswordResetLinkController extends Controller
{
    /**
     * Handle an incoming password reset link request (API).
     */
    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email' => ['required','email'],
        ]);

        if ($v->fails()) {
            return response()->json(['ok' => false, 'errors' => $v->errors()], 422);
        }

        try {
            $status = Password::sendResetLink($request->only('email'));

            if ($status == Password::RESET_LINK_SENT) {
                return response()->json(['ok' => true, 'message' => trans($status)], 200);
            }

            return response()->json(['ok' => false, 'message' => trans($status)], 500);
        } catch (\Exception $e) {
            Log::error('Password reset API error: '.$e->getMessage());
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }
}

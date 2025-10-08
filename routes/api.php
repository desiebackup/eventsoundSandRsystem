<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

// 👇 Sanctum protected route (for logged-in users)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// 👇 Optional: If you want to allow testing without login
Route::get('/user', function () {
    return response()->json([
        'id' => 1,
        'name' => 'Test User',
        'email' => 'test@example.com'
    ]);
});

// 👇 Your existing user-related routes
Route::post('/users', [UserController::class, 'store']);
Route::get('/users', [UserController::class, 'index']);

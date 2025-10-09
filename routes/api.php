<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReservationController; // ✅ Add this line

// 👇 Sanctum protected route (for logged-in users)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});



// 👇 User routes
Route::post('/users', [UserController::class, 'store']);
Route::get('/users', [UserController::class, 'index']);

// 👇 Reservation routes (Add these)
Route::get('/reservations', [ReservationController::class, 'index']);
Route::post('/reservations', [ReservationController::class, 'store']);

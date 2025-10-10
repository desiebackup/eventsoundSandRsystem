<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\ProfileController; // ✅ Add this controller

// -----------------------------
// 🔓 PUBLIC ROUTES
// -----------------------------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// -----------------------------
// 🔐 PROTECTED ROUTES (requires Sanctum token)
// -----------------------------
Route::middleware('auth:sanctum')->group(function () {

    // ✅ Authenticated user info & logout
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ✅ Profile routes
    Route::post('/profile/update', [ProfileController::class, 'update']);

    // ✅ User management (admin or extended use)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);

    // ✅ Reservation management
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
});

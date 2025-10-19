<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\ProfileController;

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

    // ✅ Reservation management (for logged-in users)
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);

    // ✅ Admin-only routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/users', [UserController::class, 'index']);   // list all users
        Route::delete('/admin/users/{id}', [UserController::class, 'destroy']); // delete user
    });

    // ✅ User registration (still available)
    Route::post('/users', [UserController::class, 'store']);
});

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PaymentController;

// -----------------------------
// 🔓 PUBLIC ROUTES
// -----------------------------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// -----------------------------
// 🔐 PROTECTED ROUTES (requires Sanctum token)
// -----------------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/payments', [PaymentController::class, 'userPayments']);
    Route::post('/user/change-password', [UserController::class, 'changePassword']);
    Route::get('/user/refund-details', [UserController::class, 'getRefundDetails']);
    Route::post('/user/refund-details', [UserController::class, 'updateRefundDetails']);

    // ✅ Authenticated user info & logout
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    // Delete own account
    Route::delete('/user', [UserController::class, 'destroySelf']);

    // ✅ Profile routes
    Route::post('/profile/update', [ProfileController::class, 'update']);

    // ✅ Reservation management (for logged-in users)
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);

    // Messaging: user sends and fetches their messages
    Route::get('/messages', [\App\Http\Controllers\MessageController::class, 'index']);
    Route::post('/messages', [\App\Http\Controllers\MessageController::class, 'store']);

    // Admin: approve reservation
    Route::post('/admin/reservations/{id}/approve', [ReservationController::class, 'approve'])->middleware(\App\Http\Middleware\AdminMiddleware::class);
    // Admin: decline reservation
    Route::post('/admin/reservations/{id}/decline', [ReservationController::class, 'decline'])->middleware(\App\Http\Middleware\AdminMiddleware::class);

    // Services CRUD (admin)
    Route::get('/admin/services', [\App\Http\Controllers\ServiceController::class, 'index'])->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::post('/admin/services', [\App\Http\Controllers\ServiceController::class, 'store'])->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::put('/admin/services/{id}', [\App\Http\Controllers\ServiceController::class, 'update'])->middleware(\App\Http\Middleware\AdminMiddleware::class);
    Route::delete('/admin/services/{id}', [\App\Http\Controllers\ServiceController::class, 'destroy'])->middleware(\App\Http\Middleware\AdminMiddleware::class);

    // ✅ Admin-only routes
    // Use the FQCN for middleware to avoid alias resolution issues during debug
    Route::middleware(\App\Http\Middleware\AdminMiddleware::class)->group(function () {
            Route::get('/admin/stats', [\App\Http\Controllers\AdminStatsController::class, 'stats']);
        Route::get('/admin/users', [UserController::class, 'index']);   // list all users
        Route::delete('/admin/users/{id}', [UserController::class, 'destroy']); // delete user
            // Admin payments
            Route::get('/admin/payments', [\App\Http\Controllers\PaymentController::class, 'index']);
            Route::post('/admin/payments', [\App\Http\Controllers\PaymentController::class, 'store']);
            Route::post('/admin/payments/{id}/paid', [\App\Http\Controllers\PaymentController::class, 'markPaid']);
            Route::post('/admin/payments/{id}/refund', [\App\Http\Controllers\PaymentController::class, 'refund']);
        // Admin messaging
        Route::get('/admin/conversations', [\App\Http\Controllers\MessageController::class, 'adminConversations']);
        Route::get('/admin/messages/{userId}', [\App\Http\Controllers\MessageController::class, 'adminMessagesForUser']);
        Route::post('/admin/messages', [\App\Http\Controllers\MessageController::class, 'adminSend']);
    });

    // ✅ User registration (still available)
    Route::post('/users', [UserController::class, 'store']);
});

// Temporary debug route (unauthenticated) — remove in production
Route::get('/debug/users', function () {
    return response()->json(App\Models\User::select('id','firstname','lastname','email','role','created_at')->get());
});

// Public services listing for customers
Route::get('/services', [\App\Http\Controllers\ServiceController::class, 'index']);

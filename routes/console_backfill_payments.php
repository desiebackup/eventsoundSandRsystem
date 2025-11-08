<?php

use Illuminate\Support\Facades\Artisan;
use App\Models\Reservation;
use App\Models\Payment;

// Backfill payments for approved reservations that lack a payment record
Artisan::command('payments:backfill', function () {
    $this->comment('Searching for approved reservations without payments...');
    $reservations = Reservation::where('status', 'approved')->get();
    $count = 0;
    foreach ($reservations as $r) {
        $exists = Payment::where('reservation_id', $r->id)->exists();
        if (!$exists) {
            Payment::create([
                'reservation_id' => $r->id,
                'user_id' => $r->user_id,
                'total_price' => $r->total_price ?? 0,
                'down_payment' => $r->total_downpayment ?? 0,
                'balance' => $r->total_balance ?? 0,
                'status' => 'unpaid',
            ]);
            $count++;
        }
    }

    $this->info("Backfilled {$count} payments.");
})->describe('Backfill payments for approved reservations');

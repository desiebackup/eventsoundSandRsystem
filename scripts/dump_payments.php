<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Payment;

$payments = Payment::with('reservation.user')->orderByDesc('id')->take(10)->get();

echo json_encode($payments->toArray(), JSON_PRETTY_PRINT);
// show any payments that already have refund metadata (debug)
$rows = \Illuminate\Support\Facades\DB::select("SELECT id, reservation_id, user_id, refund_bank_name, refund_account_name, refund_account_number, refund_receipt, refunded_at FROM payments WHERE refund_bank_name IS NOT NULL OR refund_account_name IS NOT NULL OR refund_account_number IS NOT NULL");

echo "\n\nPAYMENTS_WITH_REFUND_METADATA:\n";
echo json_encode($rows, JSON_PRETTY_PRINT);

// also show table columns to confirm refund metadata exists
echo "\n\nCOLUMNS:\n";
$cols = \Illuminate\Support\Facades\DB::select('DESCRIBE payments');
echo json_encode($cols, JSON_PRETTY_PRINT);

return 0;

<?php
// Temporary script to list users for debugging (safe, read-only)
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
// Bootstrap the framework
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$users = User::select('id','firstname','lastname','email','role','created_at')->get()->toArray();
header('Content-Type: application/json');
echo json_encode($users, JSON_PRETTY_PRINT);

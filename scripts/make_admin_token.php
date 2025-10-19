<?php
// Creates a personal access token for the first admin user and prints it.
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$admin = User::where('role', 'admin')->first();
if (! $admin) {
    fwrite(STDERR, "No admin user found\n");
    exit(1);
}

$token = $admin->createToken('cli-admin-token')->plainTextToken;
echo $token;

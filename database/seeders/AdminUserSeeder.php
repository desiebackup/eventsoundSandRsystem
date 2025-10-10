<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'firstname' => 'Desie',
            'lastname' => 'Torrenueva',
            'email' => 'admindesie@gmail.com',
            'password' => Hash::make('wisgroup2'), // ✅ Default password
            'role' => 'admin',
        ]);
    }
}

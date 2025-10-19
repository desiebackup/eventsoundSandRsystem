<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        Service::create([
            'name' => 'Basic Sound Package',
            'price' => 5000,
            'inclusions' => "Speakers\nMixer\nMicrophone",
        ]);
    }
}

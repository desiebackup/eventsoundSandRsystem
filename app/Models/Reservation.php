<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_name',
        'service_package',
        'venue',
        'address',
        'call_time',
        'down_payment',
    ];
}

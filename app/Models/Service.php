<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'inclusions',
        'description',
        'note',
        'down_payment',
        'balance',
        'type',
        'image',
    // inventory fields
    'status',
    'next_use_start',
        'next_use_end',
    ];
}

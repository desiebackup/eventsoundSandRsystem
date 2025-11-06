<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_name',
        'event_type',
        'service_package',
        'service_id',
        'venue',
        'venue_type',
        'address',
        'call_date',
        'call_time',
        'start_time',
        'end_time',
        'phone',
        'purok',
        'barangay',
        'city',
        'province',
        'down_payment',
        'user_id',
        'status',
        'approved_at',
        'approved_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function service()
    {
        return $this->belongsTo(\App\Models\Service::class, 'service_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}

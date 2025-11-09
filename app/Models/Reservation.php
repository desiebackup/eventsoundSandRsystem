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
        'custom_services',
        'venue_type',
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

    /**
     * Auto-cast JSON and date columns
     */
    protected $casts = [
        'custom_services' => 'array',
        'call_date' => 'date',
        'approved_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'reservation_id');
    }
}

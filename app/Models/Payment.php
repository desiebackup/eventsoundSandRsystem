<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'user_id',
        'total_price',
        'down_payment',
        'balance',
        'proof_image',
        'status',
        'refund_receipt',
        'refunded_at',
        'refund_bank_name',
        'refund_account_name',
        'refund_account_number',
    ];

    protected $casts = [
        'refunded_at' => 'datetime',
        'total_price' => 'decimal:2',
        'down_payment' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    /**
     * Relationship: Payment belongs to a Reservation
     */
    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'reservation_id');
    }

    /**
     * Relationship: Payment also belongs to a User (the client)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
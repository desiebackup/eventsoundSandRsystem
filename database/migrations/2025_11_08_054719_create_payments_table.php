<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            //  Linked reservation
            $table->foreignId('reservation_id')
                ->constrained('reservations')
                ->cascadeOnDelete();

            //  Linked user 
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            //  Payment amounts
            $table->decimal('total_price', 10, 2)->default(0);
            $table->decimal('down_payment', 10, 2)->default(0);
            $table->decimal('balance', 10, 2)->default(0);

            //  Proof of payment uploaded by user
            $table->string('proof_image')->nullable();

            // Payment status
            $table->enum('status', ['unpaid', 'paid', 'refunded'])->default('unpaid');

            // Refund receipt uploaded by admin
            $table->string('refund_receipt')->nullable();
            // Refund metadata
            $table->string('refund_bank_name')->nullable();
            $table->string('refund_account_name')->nullable();
            $table->string('refund_account_number')->nullable();

            $table->timestamp('refunded_at')->nullable();

            // Timestamps
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
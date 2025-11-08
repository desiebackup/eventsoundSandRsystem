<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();

            // === Primary Event / Reservation Details ===
            $table->string('event_name');
            $table->string('event_type')->nullable();
            $table->string('service_package')->nullable();

            // === Linked Service ===
            $table->unsignedBigInteger('service_id')->nullable();

            // === Custom Services JSON ===
            $table->json('custom_services')->nullable();

            // === Venue Type only (no venue/address) ===
            $table->string('venue_type')->nullable();

            // === Schedule ===
            $table->date('call_date')->nullable();
            $table->string('call_time')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();

            // === Contact & Location ===
            $table->string('phone')->nullable();
            $table->string('purok')->nullable();
            $table->string('barangay')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();

            // === Payment ===
            $table->string('down_payment')->nullable(); // image path
            $table->decimal('total_price', 10, 2)->default(0);
            $table->decimal('total_downpayment', 10, 2)->default(0);
            $table->decimal('total_balance', 10, 2)->default(0);

            // === Ownership & Workflow ===
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();

            // primary event/reservation details
            $table->string('event_name');
            $table->string('event_type')->nullable();
            $table->string('service_package')->nullable();
            // define service_id as unsignedBigInteger nullable without adding the FK here
            // (services table is created by a later-dated migration; adding the FK here fails during fresh migrate)
            $table->unsignedBigInteger('service_id')->nullable();

            // venue / location
            $table->string('venue')->nullable();
            $table->string('venue_type')->nullable();
            $table->string('address')->nullable();

            // scheduling
            $table->date('call_date')->nullable();
            $table->string('call_time')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();

            // contact / location details
            $table->string('phone')->nullable();
            $table->string('purok')->nullable();
            $table->string('barangay')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();

            // payment / metadata
            $table->string('down_payment')->nullable(); // image path

            // ownership and workflow
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

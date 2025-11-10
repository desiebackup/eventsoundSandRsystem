<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            if (!Schema::hasColumn('services', 'status')) {
                $table->string('status')->default('available')->after('type');
            }
            // (no category column needed for inventory - keep table minimal)
            if (!Schema::hasColumn('services', 'next_use_start')) {
                $table->timestamp('next_use_start')->nullable()->after('status');
            }
            if (!Schema::hasColumn('services', 'next_use_end')) {
                $table->timestamp('next_use_end')->nullable()->after('next_use_start');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            if (Schema::hasColumn('services', 'next_use_end')) {
                $table->dropColumn('next_use_end');
            }
            if (Schema::hasColumn('services', 'next_use_start')) {
                $table->dropColumn('next_use_start');
            }
            if (Schema::hasColumn('services', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};

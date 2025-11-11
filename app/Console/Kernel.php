<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Run the sync every hour so services get marked in_use 3 days before the event
        $schedule->command('services:sync-schedule')->hourly();

        // Reconcile service statuses frequently so services become available shortly after next_use_end
        // and so they are marked in_use at the start-window (start - 3 days) if appropriate.
        $schedule->command('services:reconcile-status')->everyFiveMinutes();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}

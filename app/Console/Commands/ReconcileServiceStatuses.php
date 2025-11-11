<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ReconcileServiceStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'services:reconcile-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reconcile service statuses based on next_use_start/next_use_end (flip in_use <-> available)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $now = Carbon::now();
        $this->info('ReconcileServiceStatuses started at ' . $now->toDateTimeString());

        // 1) Services that are 'in_use' but whose next_use_end is in the past -> make available
        Service::where('status', 'in_use')
            ->whereNotNull('next_use_end')
            ->where('next_use_end', '<', $now)
            ->chunkById(100, function ($services) use ($now) {
                foreach ($services as $service) {
                    try {
                        // skip if status changed since query
                        if ($service->status !== 'in_use') {
                            continue;
                        }

                        // If maintenance, skip
                        if ($service->status === 'maintenance') {
                            continue;
                        }

                        $service->status = 'available';
                        $service->next_use_start = null;
                        $service->next_use_end = null;
                        $service->save();

                        $this->info("Service #{$service->id} set to available (past next_use_end)");
                        Log::info("ReconcileServiceStatuses: service {$service->id} set to available (past next_use_end)");
                    } catch (\Exception $e) {
                        Log::error('ReconcileServiceStatuses error while updating service ' . $service->id . ': ' . $e->getMessage());
                    }
                }
            });

        // 2) Services with next_use_start/next_use_end where now is between (start - 3 days) and end -> ensure status is 'in_use'
        Service::whereNotNull('next_use_start')
            ->whereNotNull('next_use_end')
            ->chunkById(100, function ($services) use ($now) {
                foreach ($services as $service) {
                    try {
                        // Skip if already in use or maintenance
                        if ($service->status === 'in_use' || $service->status === 'maintenance') {
                            continue;
                        }

                        $start = Carbon::parse($service->next_use_start);
                        $end = Carbon::parse($service->next_use_end);

                        // Condition used in approve: mark in_use if now is in [start - 3 days, end]
                        $startWindow = $start->copy()->subDays(3);

                        if ($now->betweenIncluded($startWindow, $end)) {
                            $service->status = 'in_use';
                            $service->save();
                            $this->info("Service #{$service->id} set to in_use (within scheduled window)");
                            Log::info("ReconcileServiceStatuses: service {$service->id} set to in_use (within scheduled window)");
                        }
                    } catch (\Exception $e) {
                        Log::error('ReconcileServiceStatuses error while checking service ' . $service->id . ': ' . $e->getMessage());
                    }
                }
            });

        $this->info('ReconcileServiceStatuses completed');
        return 0;
    }
}

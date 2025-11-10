<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Service;
use App\Models\Reservation;
use Carbon\Carbon;

class SyncServiceSchedule extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'services:sync-schedule';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync services with approved reservations and auto-update statuses (in_use / available).';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔄 Syncing service schedules...');

        $now = Carbon::now();
        $threeDays = $now->copy()->addDays(3);

    // current time context (kept minimal)

        $services = Service::all();

    foreach ($services as $service) {
            try {
                $updated = false;

    // per-service summary removed for normal runs (keep logs focused)

                // Find the next approved reservation for this service
                $nextReservation = Reservation::where('service_id', $service->id)
                    ->where('status', 'approved')
                    ->whereDate('call_date', '>=', $now->toDateString())
                    ->orderBy('call_date')
                    ->orderBy('start_time')
                    ->first();

                if ($nextReservation) {
                    // next reservation summary
                    // Build start/end datetime with fallbacks
                    $startTime = $nextReservation->start_time ?: '08:00';
                    $endTime = $nextReservation->end_time ?: '12:00';

                    // Normalize call_date to Y-m-d in case it's a Carbon/date object (avoid double time strings)
                    $callDate = is_object($nextReservation->call_date)
                        ? $nextReservation->call_date->format('Y-m-d')
                        : trim((string) $nextReservation->call_date);

                    $start = Carbon::parse($callDate . ' ' . $startTime);
                    $end = Carbon::parse($callDate . ' ' . $endTime);

                    // If end is earlier or equal to start, assume end is on the following day
                    if ($end->lessThanOrEqualTo($start)) {
                        $end = $end->addDay();
                    }

                    // Update next use if changed
                        if (
                            !$service->next_use_start ||
                            !$service->next_use_end ||
                            !Carbon::parse($service->next_use_start)->equalTo($start) ||
                            !Carbon::parse($service->next_use_end)->equalTo($end)
                        ) {
                        $service->next_use_start = $start;
                        $service->next_use_end = $end;
                        $updated = true;
                        $this->info("🗓️  Updated Service {$service->id} next use: {$start} → {$end}");
                    }

                    // Compute the lead window: 3 days before start until end
                    $windowStart = $start->copy()->subDays(3);
                    if ($now->between($windowStart, $end) && $service->status !== 'maintenance') {
                        if ($service->status !== 'in_use') {
                            $service->status = 'in_use';
                            $updated = true;
                            $this->info("⚙️  Service {$service->id} marked as in_use (within 3-day lead window)");
                        }
                    } else {
                        // If the event has passed, or it's not yet within the lead window, set available (unless maintenance)
                        if ($now->greaterThan($end)) {
                            if ($service->status !== 'available' && $service->status !== 'maintenance') {
                                $service->status = 'available';
                                $updated = true;
                                $this->info("✅ Service {$service->id} set to available (event finished)");
                            }
                        } else {
                            if ($service->status !== 'maintenance' && $service->status !== 'available') {
                                $service->status = 'available';
                                $updated = true;
                                $this->info("ℹ️  Service {$service->id} set to available (event not in lead window yet)");
                            }
                        }
                    }
                } else {
                    // No upcoming reservation → clear outdated schedule
                    if ($service->next_use_end && Carbon::parse($service->next_use_end)->lessThan($now)) {
                        if ($service->status === 'in_use') {
                            $service->status = 'available';
                            $this->info("✅ Service {$service->id} reset to available (event ended)");
                        }
                        $service->next_use_start = null;
                        $service->next_use_end = null;
                        $updated = true;
                        $this->info("🧹 Service {$service->id} cleared next_use (no upcoming events)");
                    }
                }

                // Independent check: if event ended and still marked in use → set to available
                if (
                    $service->next_use_end &&
                    Carbon::parse($service->next_use_end)->lessThan($now) &&
                    $service->status === 'in_use'
                ) {
                    $service->status = 'available';
                    $updated = true;
                    $this->info("✅ Service {$service->id} set to available (event finished)");
                }

                // Save only if something changed
                if ($updated) {
                    $service->save();
                }
            } catch (\Exception $ex) {
                \Log::error('SyncServiceSchedule failed for service ' . $service->id . ': ' . $ex->getMessage());
            }
        }

        // Additionally, handle reservations that reference services via custom_services (custom items)
        try {
            $reservationsWithCustoms = Reservation::where('status', 'approved')
                ->whereNotNull('custom_services')
                ->whereDate('call_date', '>=', $now->toDateString())
                ->orderBy('call_date')
                ->get();

            foreach ($reservationsWithCustoms as $res) {
                $customs = is_array($res->custom_services)
                    ? $res->custom_services
                    : (is_string($res->custom_services) ? json_decode($res->custom_services, true) : []);

                // normalize call date
                $callDate = is_object($res->call_date) ? $res->call_date->format('Y-m-d') : trim((string) $res->call_date);
                $startTime = $res->start_time ?: '08:00';
                $endTime = $res->end_time ?: '12:00';
                $start = Carbon::parse($callDate . ' ' . $startTime);
                $end = Carbon::parse($callDate . ' ' . $endTime);
                if ($end->lessThanOrEqualTo($start)) {
                    $end = $end->addDay();
                }

                if (is_array($customs) && count($customs) > 0) {
                    foreach ($customs as $c) {
                        if (!is_array($c)) continue;
                        $cid = $c['id'] ?? null;
                        if (!$cid) continue;

                        $svc = Service::find($cid);
                        if (!$svc) continue;

                        $updated = false;
                        if (!$svc->next_use_start || !$svc->next_use_end || !Carbon::parse($svc->next_use_start)->equalTo($start) || !Carbon::parse($svc->next_use_end)->equalTo($end)) {
                            $svc->next_use_start = $start;
                            $svc->next_use_end = $end;
                            $updated = true;
                        }

                        // compute lead window and apply same rule as primary services
                        $windowStart = $start->copy()->subDays(3);
                        if ($now->between($windowStart, $end) && $svc->status !== 'maintenance') {
                            if ($svc->status !== 'in_use') {
                                $svc->status = 'in_use';
                                $updated = true;
                            }
                        } else {
                            if ($now->greaterThan($end)) {
                                if ($svc->status !== 'available' && $svc->status !== 'maintenance') {
                                    $svc->status = 'available';
                                    $updated = true;
                                }
                            } else {
                                if ($svc->status !== 'maintenance' && $svc->status !== 'available') {
                                    $svc->status = 'available';
                                    $updated = true;
                                }
                            }
                        }

                        if ($updated) $svc->save();
                    }
                }
            }
        } catch (\Exception $ex) {
            \Log::error('SyncServiceSchedule custom_services pass failed: ' . $ex->getMessage());
        }

        $this->info('✨ Service schedule sync complete.');
        return 0;
    }
}

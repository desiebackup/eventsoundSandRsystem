<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Service;
use App\Models\Reservation;
use Carbon\Carbon;

class SyncReconcileTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Ensure that when multiple reservations reference a custom service,
     * the sync command sets the nearest upcoming reservation as next_use,
     * and the reconcile command flips status to in_use when within the lead window.
     */
    public function test_custom_service_sync_and_reconcile()
    {
        // freeze now for deterministic test
        $now = Carbon::now();
        Carbon::setTestNow($now);

        // create a custom service
        $service = Service::create([
            'name' => 'Test Custom Item',
            'price' => 100,
            'type' => 'custom',
            'status' => 'available',
        ]);

        // reservation A: near future (2 days from now)
        $resA_date = $now->copy()->addDays(2)->format('Y-m-d');
        $resA = Reservation::create([
            'event_name' => 'Near Event',
            'custom_services' => [['id' => $service->id, 'quantity' => 1]],
            'call_date' => $resA_date,
            'start_time' => '08:00:00',
            'end_time' => '12:00:00',
            'status' => 'approved',
            'approved_at' => Carbon::now(),
        ]);

        // reservation B: later future (50 days from now)
        $resB_date = $now->copy()->addDays(50)->format('Y-m-d');
        $resB = Reservation::create([
            'event_name' => 'Far Event',
            'custom_services' => [['id' => $service->id, 'quantity' => 1]],
            'call_date' => $resB_date,
            'start_time' => '10:00:00',
            'end_time' => '14:00:00',
            'status' => 'approved',
            'approved_at' => Carbon::now(),
        ]);

        // run sync
        $this->artisan('services:sync-schedule')->run();

        $service->refresh();

        // next_use should be set and equal to the earlier reservation (resA)
        $this->assertNotNull($service->next_use_start, 'next_use_start should be set by sync');
        $this->assertEquals($resA_date . ' 08:00:00', $service->next_use_start->format('Y-m-d H:i:s'));

        // run reconcile (should mark as in_use since now is within [start-3days, end])
        $this->artisan('services:reconcile-status')->run();
        $service->refresh();
        $this->assertEquals('in_use', $service->status, 'Service should be in_use after reconcile when within lead window');
    }
}

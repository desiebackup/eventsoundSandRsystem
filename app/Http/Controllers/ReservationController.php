<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Service;
use App\Models\Payment;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReservationController extends Controller
{
    /**
     * Display reservations depending on user role.
     */
    public function index()
    {
        $user = auth()->user();

        if ($user && $user->role === 'admin') {
            return response()->json(
                Reservation::with(['user', 'approver', 'service', 'payment'])
                    ->orderByDesc('created_at')
                    ->get()
            );
        }

        // For normal users
        return response()->json(
            Reservation::with(['user', 'service'])
                ->where('user_id', $user?->id)
                ->orderByDesc('created_at')
                ->get()
        );
    }

    /**
     * Store a new reservation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_name' => 'required|string|max:255',
            'event_type' => 'nullable|string|max:255',
            'service_package' => 'nullable|string|max:255',
            'service_id' => 'nullable|integer|exists:services,id',
            'custom_services' => 'nullable',
            'venue_type' => 'nullable|string|max:255',
            'call_date' => 'nullable|date',
            'call_time' => 'nullable|string|max:255',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'phone' => 'nullable|string|max:32',
            'purok' => 'nullable|string|max:255',
            'barangay' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'down_payment' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
        ]);

        // Handle down payment image upload
        if ($request->hasFile('down_payment')) {
            $validated['down_payment'] = $request->file('down_payment')->store('down_payments', 'public');
        }

        $validated['user_id'] = auth()->id();

        $service = !empty($validated['service_id'])
            ? Service::find($validated['service_id'])
            : null;

        if ($service && empty($validated['service_package'])) {
            $validated['service_package'] = $service->name;
        }

        // Decode custom services safely
        $customs = [];
        if ($request->filled('custom_services')) {
            $customs = is_string($request->custom_services)
                ? json_decode($request->custom_services, true)
                : $request->custom_services;
            $validated['custom_services'] = $customs;
        }

        // Compute totals
        $servicePrice = $service?->price ?? 0;
        $serviceDown = $service?->down_payment ?? 0;
        $customTotal = collect($customs)->sum(fn($c) => ($c['price'] ?? 0) * ($c['quantity'] ?? 1));
        $customDown = collect($customs)->sum(fn($c) => ($c['down_payment'] ?? 0) * ($c['quantity'] ?? 1));

        $validated['total_price'] = $servicePrice + $customTotal;
        $validated['total_downpayment'] = $serviceDown + $customDown;
        $validated['total_balance'] = max(0, $validated['total_price'] - $validated['total_downpayment']);

        $reservation = Reservation::create($validated + ['status' => 'pending']);

        return response()->json(
            Reservation::with(['user', 'service'])->find($reservation->id),
            201
        );
    }

    /**
     * Approve reservation (admin only).
     * Also updates service availability and auto-sets "in_use" if within 3 days.
     */
    public function approve(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Load reservation with related data
        $reservation = Reservation::with(['service', 'user'])->findOrFail($id);

        $reservation->status = 'approved';
        $reservation->approved_at = now();
        $reservation->approved_by = $user->id;

        // Recompute totals
        $service = $reservation->service;
        $customs = collect($reservation->custom_services ?? []);

        $servicePrice = $service?->price ?? 0;
        $serviceDown  = $service?->down_payment ?? 0;
        $customTotal  = $customs->sum(fn($c) => ($c['price'] ?? 0) * ($c['quantity'] ?? 1));
        $customDown   = $customs->sum(fn($c) => ($c['down_payment'] ?? 0) * ($c['quantity'] ?? 1));

        $reservation->total_price = $servicePrice + $customTotal;
        $reservation->total_downpayment = $serviceDown + $customDown;
        $reservation->total_balance = max(0, $reservation->total_price - $reservation->total_downpayment);
        $reservation->save();

        // Create or update payment record
        $payment = Payment::firstOrCreate(
            ['reservation_id' => $reservation->id],
            [
                'reservation_id' => $reservation->id,
                'user_id' => $reservation->user_id,
                'total_price' => $reservation->total_price,
                'down_payment' => $reservation->total_downpayment,
                'balance' => $reservation->total_balance,
                'status' => 'unpaid',
            ]
        );

        // ✅ Service usage + status management
        $affectedServiceIds = [];
        if ($service && $reservation->call_date) {
            try {
                $startTime = $reservation->start_time ?: '08:00'; // Default start
                $endTime = $reservation->end_time ?: '12:00'; // Default end

                // Normalize call_date in case it's a Carbon/date object
                $callDate = is_object($reservation->call_date)
                    ? $reservation->call_date->format('Y-m-d')
                    : trim((string) $reservation->call_date);

                $start = Carbon::parse($callDate . ' ' . $startTime);
                $end = Carbon::parse($callDate . ' ' . $endTime);

                // If end is earlier or equal to start, assume the event ends the next day
                if ($end->lessThanOrEqualTo($start)) {
                    $end = $end->addDay();
                }

                $service->next_use_start = $start;
                $service->next_use_end = $end;

                // Auto determine time window using explicit 3-day lead window
                $now = Carbon::now();
                $windowStart = $start->copy()->subDays(3);

                if ($now->between($windowStart, $end) && $service->status !== 'maintenance') {
                    $service->status = 'in_use';
                } else {
                    if ($now->greaterThan($end) && $service->status !== 'maintenance') {
                        $service->status = 'available';
                    } else {
                        if ($service->status !== 'maintenance') {
                            $service->status = 'available';
                        }
                    }
                }

                $service->save();
                $affectedServiceIds[] = $service->id;
            } catch (\Exception $ex) {
                \Log::error('Failed to update service next use on approval: ' . $ex->getMessage());
            }
        }

        // Also handle custom services included in the reservation (they may reference real Service records)
        try {
            $customs = is_array($reservation->custom_services) ? $reservation->custom_services : (is_string($reservation->custom_services) ? json_decode($reservation->custom_services, true) : []);
            if (is_array($customs) && count($customs) > 0) {
                foreach ($customs as $c) {
                    if (!is_array($c)) continue;
                    $cid = $c['id'] ?? null;
                    if (!$cid) continue;

                    $cservice = Service::find($cid);
                    if (!$cservice) continue;

                    try {
                        $cservice->next_use_start = $start ?? (isset($callDate) ? Carbon::parse($callDate . ' ' . ($c['start_time'] ?? $reservation->start_time ?? '08:00')) : null);
                        $cservice->next_use_end = $end ?? (isset($callDate) ? Carbon::parse($callDate . ' ' . ($c['end_time'] ?? $reservation->end_time ?? '12:00')) : null);

                        // Determine status similar to primary service
                        $now = Carbon::now();
                        if (isset($cservice->next_use_start) && $now->diffInDays($cservice->next_use_start, false) <= 3 && $now->diffInDays($cservice->next_use_start, false) >= 0) {
                            $cservice->status = 'in_use';
                        } elseif (isset($cservice->next_use_end) && $now->greaterThan($cservice->next_use_end) && $cservice->status !== 'maintenance') {
                            $cservice->status = 'available';
                        } else {
                            if ($cservice->status !== 'maintenance') {
                                $cservice->status = 'available';
                            }
                        }

                        $cservice->save();
                        $affectedServiceIds[] = $cservice->id;
                    } catch (\Exception $e) {
                        \Log::error('Failed updating custom service schedule for service ' . $cid . ': ' . $e->getMessage());
                    }
                }
            }
        } catch (\Exception $ex) {
            \Log::error('Failed processing custom services on approval: ' . $ex->getMessage());
        }

        // Load fresh service rows for any affected services so the frontend can update immediately
        $updatedServices = [];
        if (!empty($affectedServiceIds)) {
            $updatedServices = \App\Models\Service::whereIn('id', array_unique($affectedServiceIds))->get();
        }

        return response()->json([
            'message' => 'Reservation approved and service status updated automatically.',
            'reservation' => $reservation,
            'payment' => $payment,
            'updated_services' => $updatedServices,
        ]);
    }

    /**
     * Decline reservation (admin only).
     */
    public function decline(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $reservation = Reservation::findOrFail($id);
        $reservation->status = 'declined';
        $reservation->save();

        return response()->json(['message' => 'Reservation declined.', 'reservation' => $reservation]);
    }

    /**
     * Delete or cancel reservation.
     */
    public function destroy($id)
    {
        $user = auth()->user();
        $reservation = Reservation::findOrFail($id);

        if ($user->role !== 'admin' && $reservation->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($user->role !== 'admin') {
            $reservation->status = 'cancelled';
            $reservation->save();
            return response()->json(['message' => 'Reservation cancelled.']);
        }

        $reservation->delete();
        return response()->json(['message' => 'Reservation deleted.']);
    }
}

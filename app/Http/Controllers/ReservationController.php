<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Service;
use App\Models\Payment;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user && $user->role === 'admin') {
            return response()->json(
                Reservation::with(['user', 'approver', 'service'])->orderByDesc('created_at')->get()
            );
        }

        return response()->json(
            Reservation::with('user')->where('user_id', $user?->id)->orderByDesc('created_at')->get()
        );
    }

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

        // decode custom services safely
        $customs = [];
        if ($request->filled('custom_services')) {
            $customs = is_string($request->custom_services)
                ? json_decode($request->custom_services, true)
                : $request->custom_services;
            $validated['custom_services'] = $customs;
        }

        // compute totals for reservation fields (store them for later display)
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

    public function approve(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // load reservation with service and custom data
        $reservation = Reservation::with(['service', 'user'])->findOrFail($id);

        $reservation->status = 'approved';
        $reservation->approved_at = now();
        $reservation->approved_by = $user->id;

        // (re)compute totals to ensure reservation totals are accurate
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

        // create Payment with the correct column names that your Payment model expects
        // (adjust keys below if your Payment migration has different column names)
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

        return response()->json([
            'message' => 'Reservation approved and payment record ensured.',
            'reservation' => $reservation,
            'payment' => $payment,
        ]);
    }

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
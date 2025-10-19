<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index()
    {
        // Return reservations with user and approver info for admins; for regular users, return their own reservations
        $user = auth()->user();
        if ($user && $user->role === 'admin') {
            return response()->json(Reservation::with(['user', 'approver', 'service'])->get());
        }

        return response()->json(Reservation::with('user')->where('user_id', $user?->id)->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_name' => 'required|string|max:255',
            'service_package' => 'nullable|string|max:255',
            'service_id' => 'nullable|integer|exists:services,id',
            'venue' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'call_time' => 'required|string|max:255',
            'down_payment' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('down_payment')) {
            $path = $request->file('down_payment')->store('down_payments', 'public');
            $validated['down_payment'] = $path;
        }

        // Attach current user
        $validated['user_id'] = auth()->id();

        // If service_id provided, try to set service_package for human readable backup
        if (isset($validated['service_id']) && empty($validated['service_package'])) {
            $svc = \App\Models\Service::find($validated['service_id']);
            if ($svc) $validated['service_package'] = $svc->name;
        }

        $reservation = Reservation::create($validated + ['status' => 'pending']);

        return response()->json($reservation, 201);
    }

    // Admin approves reservation (manually after checking down payment image)
    public function approve(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $reservation = Reservation::findOrFail($id);
        $reservation->status = 'approved';
        $reservation->approved_at = now();
        $reservation->approved_by = $user->id;
        $reservation->save();

        return response()->json($reservation);
    }

    // Admin declines reservation
    public function decline(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $reservation = Reservation::findOrFail($id);
        $reservation->status = 'declined';
        // optionally track who declined and when if schema supports it
        if (in_array('declined_at', $reservation->getFillable())) {
            $reservation->declined_at = now();
        }
        if (in_array('declined_by', $reservation->getFillable())) {
            $reservation->declined_by = $user->id;
        }
        $reservation->save();

        return response()->json($reservation);
    }

    public function destroy($id)
    {
        $user = auth()->user();
        $reservation = Reservation::findOrFail($id);

        // owner can cancel; admin can delete
        if ($user->role !== 'admin' && $reservation->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // If owner cancels, keep the record and mark as cancelled so it appears in recent activities
        if ($user->role !== 'admin' && $reservation->user_id === $user->id) {
            $reservation->status = 'cancelled';
            $reservation->save();
            return response()->json(['message' => 'Reservation cancelled']);
        }

        // Admins can permanently delete
        $reservation->delete();
        return response()->json(['message' => 'Reservation deleted']);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index()
    {
        return response()->json(Reservation::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_name' => 'required|string|max:255',
            'service_package' => 'required|string|max:255',
            'venue' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'call_time' => 'required|string|max:255',
            'down_payment' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('down_payment')) {
            $path = $request->file('down_payment')->store('down_payments', 'public');
            $validated['down_payment'] = $path;
        }

        $reservation = Reservation::create($validated);

        return response()->json($reservation, 201);
    }
}

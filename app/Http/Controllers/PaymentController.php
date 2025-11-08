<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    /**
     * Ensure only admins can access payment routes.
     */
    protected function authorizeAdmin()
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            abort(403, 'Access denied. Admins only.');
        }
    }

    /**
     * Admin: List all payments with related reservation + user data.
     */
    public function index()
    {
        $this->authorizeAdmin();

        $payments = Payment::with(['reservation.user', 'reservation.service'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($payments);
    }

    /**
     * User: Get payments for the authenticated user
     */
    public function userPayments()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([], 401);
        }

        $payments = Payment::with('reservation')->where('user_id', $user->id)->orderByDesc('created_at')->get();

        return response()->json($payments);
    }

    /**
     * Admin: Mark payment as fully paid in person.
     */
    public function markPaid($id)
    {
        $this->authorizeAdmin();

        $payment = Payment::findOrFail($id);
        $payment->status = 'paid';
        $payment->save();

        return response()->json([
            'message' => 'Payment marked as fully paid.',
            'payment' => $payment,
        ]);
    }

    /**
     * Admin: Upload refund receipt and mark as refunded.
     */
    public function refund(Request $request, $id)
    {
        $this->authorizeAdmin();

        $payment = Payment::findOrFail($id);

        $validated = $request->validate([
            'refund_receipt' => 'required|image|mimes:jpg,jpeg,png|max:4096',
        ]);

        if ($request->hasFile('refund_receipt')) {
            // Remove old refund receipt if it exists
            if ($payment->refund_receipt && Storage::disk('public')->exists($payment->refund_receipt)) {
                Storage::disk('public')->delete($payment->refund_receipt);
            }

            // Upload new refund proof
            $path = $request->file('refund_receipt')->store('refunds', 'public');

            // Also accept and persist refund metadata if provided
            $refundData = [
                'refund_receipt' => $path,
                'status' => 'refunded',
                'refunded_at' => now(),
            ];

            $optional = $request->only([
                'refund_bank_name',
                'refund_account_name',
                'refund_account_number',
            ]);

            foreach ($optional as $k => $v) {
                if (!is_null($v) && $v !== '') {
                    $refundData[$k] = $v;
                }
            }

            $payment->update($refundData);

            return response()->json([
                'message' => 'Refund processed successfully.',
                'payment' => $payment,
            ]);
        }

        return response()->json(['message' => 'No refund file uploaded.'], 400);
    }

    /**
     * (Optional) Admin: Create a manual payment record.
     * Typically auto-created when a reservation is approved.
     */
    public function store(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'reservation_id' => 'required|integer|exists:reservations,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'total_price' => 'required|numeric|min:0',
            'down_payment' => 'nullable|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
            'proof_image' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'status' => 'nullable|string|in:unpaid,paid,refunded',
        ]);

        if ($request->hasFile('proof_image')) {
            $validated['proof_image'] = $request->file('proof_image')->store('payments', 'public');
        }

        $payment = Payment::create($validated);

        return response()->json([
            'message' => 'Payment record created successfully.',
            'payment' => $payment,
        ], 201);
    }
}
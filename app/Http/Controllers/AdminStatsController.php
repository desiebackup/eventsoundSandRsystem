<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Reservation;
use App\Models\Service;
use Illuminate\Http\Request;

class AdminStatsController extends Controller
{
    public function stats(Request $request)
    {
        // exclude admins from the user total
        $totalUsers = User::where('role', '!=', 'admin')->count();
        $totalReservations = Reservation::count();
        $totalServices = Service::count();
        $totalPayments = Reservation::where('status', 'approved')->count();

        $recentActivities = [];

        // recent reservations
        $recentRes = Reservation::with('user')->orderBy('created_at', 'desc')->limit(5)->get();
        foreach ($recentRes as $r) {
            $recentActivities[] = [
                'type' => 'reservation',
                'message' => sprintf('%s made a reservation for %s', $r->user?->firstname ?? 'User', $r->event_name),
                'time' => $r->created_at,
            ];
        }

        // recent approvals
        $recentApprovals = Reservation::with('approver')->whereNotNull('approved_at')->orderBy('approved_at', 'desc')->limit(5)->get();
        foreach ($recentApprovals as $a) {
            $recentActivities[] = [
                'type' => 'approval',
                'message' => sprintf('Reservation %d approved by %s', $a->id, $a->approver?->firstname ?? 'Admin'),
                'time' => $a->approved_at,
            ];
        }

        // recent declines (use updated_at since declined_at may not exist)
        $recentDeclines = Reservation::with('approver')->where('status', 'declined')->orderBy('updated_at', 'desc')->limit(5)->get();
        foreach ($recentDeclines as $d) {
            $recentActivities[] = [
                'type' => 'decline',
                'message' => sprintf('Reservation %d declined', $d->id),
                'time' => $d->updated_at,
            ];
        }

        // recent cancellations by users
        $recentCancels = Reservation::with('user')->where('status', 'cancelled')->orderBy('updated_at', 'desc')->limit(5)->get();
        foreach ($recentCancels as $c) {
            $recentActivities[] = [
                'type' => 'cancel',
                'message' => sprintf('%s cancelled reservation %d', $c->user?->firstname ?? 'User', $c->id),
                'time' => $c->updated_at,
            ];
        }

        // recent service creations/updates
        $recentServices = Service::orderBy('created_at', 'desc')->limit(5)->get();
        foreach ($recentServices as $s) {
            $recentActivities[] = [
                'type' => 'service',
                'message' => sprintf('Service "%s" was added', $s->name),
                'time' => $s->created_at,
            ];
        }

        // recent user registrations (exclude admins)
        $recentUsers = User::where('role', '!=', 'admin')->orderBy('created_at', 'desc')->limit(5)->get();
        foreach ($recentUsers as $u) {
            $recentActivities[] = [
                'type' => 'signup',
                'message' => sprintf('%s %s registered', $u->firstname, $u->lastname),
                'time' => $u->created_at,
            ];
        }

        return response()->json([
            'totals' => [
                'users' => $totalUsers,
                'reservations' => $totalReservations,
                'payments' => $totalPayments,
                'services' => $totalServices,
            ],
            'recent' => $recentActivities,
        ]);
    }
}

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

        // collect raw recent items from multiple sources (no per-source limit yet)
        $recentRes = Reservation::with('user')->orderBy('created_at', 'desc')->limit(10)->get();
        foreach ($recentRes as $r) {
            $recentActivities[] = [
                'type' => 'reservation',
                'message' => sprintf('%s made a reservation for %s', $r->user?->firstname ?? 'User', $r->event_name),
                'time' => $r->created_at,
            ];
        }

        $recentApprovals = Reservation::with('approver')->whereNotNull('approved_at')->orderBy('approved_at', 'desc')->limit(10)->get();
        foreach ($recentApprovals as $a) {
            $recentActivities[] = [
                'type' => 'approval',
                'message' => sprintf('Reservation %d approved by %s', $a->id, $a->approver?->firstname ?? 'Admin'),
                'time' => $a->approved_at,
            ];
        }

        $recentDeclines = Reservation::where('status', 'declined')->orderBy('updated_at', 'desc')->limit(10)->get();
        foreach ($recentDeclines as $d) {
            $recentActivities[] = [
                'type' => 'decline',
                'message' => sprintf('Reservation %d declined', $d->id),
                'time' => $d->updated_at,
            ];
        }

        $recentCancels = Reservation::with('user')->where('status', 'cancelled')->orderBy('updated_at', 'desc')->limit(10)->get();
        foreach ($recentCancels as $c) {
            $recentActivities[] = [
                'type' => 'cancel',
                'message' => sprintf('%s cancelled reservation %d', $c->user?->firstname ?? 'User', $c->id),
                'time' => $c->updated_at,
            ];
        }

        $recentServices = Service::orderBy('created_at', 'desc')->limit(10)->get();
        foreach ($recentServices as $s) {
            $recentActivities[] = [
                'type' => 'service',
                'message' => sprintf('Service "%s" was added', $s->name),
                'time' => $s->created_at,
            ];
        }

        $recentUsers = User::where('role', '!=', 'admin')->orderBy('created_at', 'desc')->limit(10)->get();
        foreach ($recentUsers as $u) {
            $recentActivities[] = [
                'type' => 'signup',
                'message' => sprintf('%s %s registered', $u->firstname, $u->lastname),
                'time' => $u->created_at,
            ];
        }

        // sort merged activities by timestamp (most recent first) and limit the combined list
        usort($recentActivities, function ($a, $b) {
            $ta = strtotime((string)$a['time']);
            $tb = strtotime((string)$b['time']);
            return $tb <=> $ta;
        });

        // limit to the most recent 8 activities
        $recentActivities = array_slice($recentActivities, 0, 8);

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

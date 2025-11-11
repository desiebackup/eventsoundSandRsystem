<?php

namespace App\Http\Controllers\Dev;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TestMailController extends Controller
{
    /**
     * Send a simple test email (development only).
     *
     * Usage: GET /dev/send-test-mail?to=you@example.com
     */
    public function sendTest(Request $request)
    {
        if (! app()->environment('local')) {
            abort(404);
        }

        $to = $request->query('to', config('mail.from.address'));

        try {
            Mail::raw("This is a test email from Event Sound Pro. If you see this in your inbox then SMTP is working.", function ($message) use ($to) {
                $message->to($to);
                $message->subject('Test email from Event Sound Pro');
            });

            return response()->json(['ok' => true, 'message' => "Mail queued/sent to {$to}"], 200);
        } catch (\Exception $e) {
            Log::error('Dev test mail failed: '.$e->getMessage());
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }
}

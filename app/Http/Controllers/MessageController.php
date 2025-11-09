<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // User: get own messages
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json([], 401);

        $messages = Message::where('user_id', $user->id)->orderBy('created_at')->get();
        return response()->json($messages);
    }

    // User: send a message
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $validated = $request->validate([
            'text' => 'required|string',
        ]);

        $message = Message::create([
            'user_id' => $user->id,
            'sender' => 'user',
            'text' => $validated['text'],
        ]);

        return response()->json($message, 201);
    }

    // Admin: list conversations (grouped by user)
    public function adminConversations()
    {
        $this->authorizeAdmin();

        $conversations = Message::selectRaw('user_id, MAX(created_at) as last_at')
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->orderByDesc('last_at')
            ->get()
            ->map(function ($row) {
                $user = User::find($row->user_id);
                $lastMessage = Message::where('user_id', $row->user_id)->orderByDesc('created_at')->first();
                return [
                    'user' => $user ? ['id' => $user->id, 'firstname' => $user->firstname, 'lastname' => $user->lastname, 'email' => $user->email] : null,
                    'last_message' => $lastMessage,
                ];
            });

        return response()->json($conversations);
    }

    // Admin: get messages for a user
    public function adminMessagesForUser($userId)
    {
        $this->authorizeAdmin();
        $messages = Message::where('user_id', $userId)->orderBy('created_at')->get();
        return response()->json($messages);
    }

    // Admin: send message to user
    public function adminSend(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'text' => 'required|string',
        ]);

        $message = Message::create([
            'user_id' => $validated['user_id'],
            'sender' => 'admin',
            'text' => $validated['text'],
        ]);

        return response()->json($message, 201);
    }

    protected function authorizeAdmin()
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            abort(403);
        }
    }
}

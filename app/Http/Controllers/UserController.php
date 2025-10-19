<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // ✅ Get all users with role = 'user' (for admin)
    public function index()
    {
        // Return only non-admin users for the Manage Users UI
        $users = User::where('role', '!=', 'admin')
            ->select('id', 'firstname', 'lastname', 'email', 'role', 'created_at')
            ->get();

        return response()->json($users);
    }

    // ✅ Create new user (optional for admin/manual registration)
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'firstname' => 'required|string|max:255',
                'lastname' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6',
                'role' => 'nullable|string|in:user,admin',
            ]);

            // Default role to 'user'. If the current user is admin and provided role is 'admin', allow creating an admin.
            $role = 'user';
            $current = auth()->user();
            if (!empty($validated['role']) && $validated['role'] === 'admin' && $current && $current->role === 'admin') {
                $role = 'admin';
            }

            $user = User::create([
                'firstname' => $validated['firstname'],
                'lastname' => $validated['lastname'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $role,
            ]);

            return response()->json(['message' => 'User saved successfully', 'user' => $user], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ✅ Delete user by ID
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Prevent deleting admin accounts
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot delete admin accounts'], 403);
        }

        // Prevent a user from deleting themselves (avoid accidental lockout)
        $current = auth()->user();
        if ($current && $current->id === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account'], 403);
        }

        try {
            $user->delete();
            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete user', 'details' => $e->getMessage()], 500);
        }
    }
}

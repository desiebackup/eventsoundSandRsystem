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
        // Include avatar so admin UI (messages, user lists) can render profile pictures
        $users = User::where('role', '!=', 'admin')
            ->select('id', 'firstname', 'lastname', 'email', 'role', 'avatar', 'created_at')
            ->get();

        return response()->json($users);
    }

    // ✅ Create new user (for admin or manual registration)
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

            // Default to 'user', allow admin to create another admin
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

        // Prevent a user from deleting themselves
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

    // ✅ Update Refund Details (for clients updating their refund method)
    public function updateRefundDetails(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'refund_bank_name' => 'nullable|string|max:255',
            'refund_account_name' => 'nullable|string|max:255',
            'refund_account_number' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Refund details updated successfully.',
            'user' => $user,
        ]);
    }

    // ✅ Get Refund Details for the authenticated user
    public function getRefundDetails(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Return only the refund-related fields
        return response()->json([
            'refund_bank_name' => $user->refund_bank_name,
            'refund_account_name' => $user->refund_account_name,
            'refund_account_number' => $user->refund_account_number,
        ]);
    }
    
    // ✅ Delete the authenticated user's own account (self-delete)
    public function destroySelf(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // require password confirmation for safety
        $request->validate([
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Password is incorrect.'], 422);
        }

        // Prevent deletion of admin accounts via this endpoint
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admin accounts cannot be deleted via this endpoint'], 403);
        }

        try {
            // Revoke all personal tokens so client can't reuse them
            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }

            $user->delete();

            return response()->json(['message' => 'Account deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete account', 'details' => $e->getMessage()], 500);
        }
    }
    // ✅ Change Password (for logged-in users)
public function changePassword(Request $request)
{
    $request->validate([
        'current_password' => 'required',
        'new_password' => 'required|min:8',
    ]);

    $user = $request->user();

    // Check if old password matches
    if (!Hash::check($request->current_password, $user->password)) {
        return response()->json(['error' => 'Current password is incorrect.'], 422);
    }

    // Update to new password
    $user->password = Hash::make($request->new_password);
    $user->save();

    return response()->json(['message' => 'Password updated successfully.']);
}
}
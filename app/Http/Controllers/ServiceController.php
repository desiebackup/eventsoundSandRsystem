<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;
use Illuminate\Validation\ValidationException;

class ServiceController extends Controller
{
    /**
     * Display a listing of the services.
     * Supports optional filtering by type (?type=package/custom)
     */
    public function index(Request $request)
    {
        $query = Service::query();

        if ($request->has('type')) {
            $query->where('type', $request->get('type'));
        }

        // Return all services with image URL
        $services = $query->get()->map(function ($service) {
            $service->image_url = $service->image
                ? asset('storage/' . $service->image)
                : null;
            return $service;
        });

        return response()->json($services);
    }

    /**
     * Store a newly created service.
     */
    public function store(Request $request)
    {
        try {
            // Normalize frontend keys
            $request->merge([
                'down_payment' => $request->input('downPayment', $request->input('down_payment', 0)),
                'balance' => $request->input('balance', $request->input('balance', 0)),
            ]);

            // Validation
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'down_payment' => 'nullable|numeric|min:0',
                'balance' => 'nullable|numeric|min:0',
                'type' => 'required|in:package,custom',
                'inclusions' => 'nullable|string',
                'description' => 'nullable|string',
                'note' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            ]);

            // Handle image upload
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('services', 'public');
                $validated['image'] = $path;
            }

            $service = Service::create($validated);
            $service->image_url = $service->image ? asset('storage/' . $service->image) : null;

            return response()->json($service, 201);
        } catch (Throwable $ex) {
            if ($ex instanceof ValidationException) {
                throw $ex;
            }
            Log::error('Service store failed: ' . $ex->getMessage(), ['exception' => $ex]);
            return response()->json(['message' => 'Service store failed', 'error' => $ex->getMessage()], 500);
        }
    }

    /**
     * Update the specified service.
     */
    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        try {
            $request->merge([
                'down_payment' => $request->input('downPayment', $request->input('down_payment', $service->down_payment ?? 0)),
                'balance' => $request->input('balance', $request->input('balance', $service->balance ?? 0)),
            ]);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'down_payment' => 'nullable|numeric|min:0',
                'balance' => 'nullable|numeric|min:0',
                'type' => 'required|in:package,custom',
                'inclusions' => 'nullable|string',
                'description' => 'nullable|string',
                'note' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            ]);

            // Replace image if new one uploaded
            if ($request->hasFile('image')) {
                if ($service->image && Storage::disk('public')->exists($service->image)) {
                    Storage::disk('public')->delete($service->image);
                }
                $path = $request->file('image')->store('services', 'public');
                $validated['image'] = $path;
            }

            $service->update($validated);
            $service->image_url = $service->image ? asset('storage/' . $service->image) : null;

            return response()->json($service);
        } catch (Throwable $ex) {
            if ($ex instanceof ValidationException) {
                throw $ex;
            }
            Log::error('Service update failed: ' . $ex->getMessage(), ['id' => $id, 'exception' => $ex]);
            return response()->json(['message' => 'Service update failed', 'error' => $ex->getMessage()], 500);
        }
    }

    /**
     * Remove the specified service.
     */
    public function destroy($id)
    {
        $service = Service::findOrFail($id);

        // Delete the image if it exists
        if ($service->image && Storage::disk('public')->exists($service->image)) {
            Storage::disk('public')->delete($service->image);
        }

        $service->delete();

        return response()->json(['message' => 'Service deleted']);
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;
use Illuminate\Validation\ValidationException;

class ServiceController extends Controller
{
    public function index()
    {
        return response()->json(Service::all());
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'price' => 'required|integer',
                'inclusions' => 'nullable|string',
                'note' => 'nullable|string',
            ]);

            $service = Service::create($validated);
            return response()->json($service, 201);
        } catch (Throwable $ex) {
            if ($ex instanceof ValidationException) {
                throw $ex; // let Laravel convert to 422 with validation details
            }
            Log::error('Service store failed: ' . $ex->getMessage(), ['exception' => $ex]);
            return response()->json(['message' => 'Service store failed', 'error' => $ex->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'price' => 'required|integer',
                'inclusions' => 'nullable|string',
                'note' => 'nullable|string',
            ]);

            $service->update($validated);

            return response()->json($service);
        } catch (Throwable $ex) {
            if ($ex instanceof ValidationException) {
                throw $ex; // preserve validation response
            }
            Log::error('Service update failed: ' . $ex->getMessage(), ['id' => $id, 'exception' => $ex]);
            return response()->json(['message' => 'Service update failed', 'error' => $ex->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $service = Service::findOrFail($id);
        $service->delete();
        return response()->json(['message' => 'Service deleted']);
    }
}

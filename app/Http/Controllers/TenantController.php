<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return Inertia::render('admin/tenants/Index', [
            'data' => Tenant::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/tenants/Create');
    }

    public function edit(Tenant $tenant)
    {
        return Inertia::render('admin/tenants/Edit', [
            'data' => $tenant,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|regex:/^[a-z0-9-]+$/|unique:tenants,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $tenant = Tenant::create([
            'id' => $validated['slug'],
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('tenants')->with('success', 'Tenant created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tenant $tenant)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tenant $tenant)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tenant $tenant)
    {
        //
    }
}

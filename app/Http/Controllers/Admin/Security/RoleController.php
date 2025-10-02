<?php

namespace App\Http\Controllers\Admin\Security;

use App\Http\Controllers\Controller;
use App\Models\Admin\Security\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('admin/security/roles/Index', [
            'data' => Role::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/security/roles/Upsert', [
            'data' => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'guard_name' => 'required|string|max:255',
            ]);
            Role::create($validated);
        } catch (\Exception $e) {
            return redirect()->route('admin.security.role')->withErrors(['error' => 'Error al crear: '.$e->getMessage()]);
        }

        return redirect()->route('admin.security.role')->with('success', 'Registro creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $data = Role::findOrFail($id);

        return Inertia::render('admin/security/roles/Upsert', [
            'data' => $data,
            'mode' => 'edit',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'guard_name' => 'required|string|max:255',
            ]);
            $data = Role::findOrFail($id);
            $data->update($validated);
        } catch (\Exception $e) {
            return redirect()->route('admin.security.role')->withErrors(['error' => 'Error al actualizar: '.$e->getMessage()]);
        }

        return redirect()->route('admin.security.role')->with('success', 'Registro actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $data = Role::findOrFail($id);
            $data->delete();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al eliminar: '.$e->getMessage()]);
        }

        return redirect()->route('admin.security.role')->with('success', 'Registro eliminado exitosamente.');
    }
}

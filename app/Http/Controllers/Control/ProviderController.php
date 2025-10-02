<?php

namespace App\Http\Controllers\Control;

use App\Http\Controllers\Controller;
use App\Models\Control\Provider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProviderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('control/providers/Index', [
            'data' => Provider::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('control/providers/Upsert', [
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
                'average' => 'nullable|numeric',
            ]);
            Provider::create($validated);
        } catch (\Exception $e) {
            return redirect()->route('control.provider')->withErrors(['error' => 'Error al crear: '.$e->getMessage()]);
        }

        return redirect()->route('control.provider')->with('success', 'Registro creado exitosamente.');
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
        $data = Provider::findOrFail($id);

        return Inertia::render('control/providers/Upsert', [
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
                'average' => 'nullable|numeric',
            ]);
            $data = Provider::findOrFail($id);
            $data->update($validated);
        } catch (\Exception $e) {
            return redirect()->route('control.provider')->withErrors(['error' => 'Error al actualizar: '.$e->getMessage()]);
        }

        return redirect()->route('control.provider')->with('success', 'Registro actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $data = Provider::findOrFail($id);
            $data->delete();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al eliminar: '.$e->getMessage()]);
        }

        return redirect()->route('control.provider')->with('success', 'Registro eliminado exitosamente.');
    }
}

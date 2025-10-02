<?php

namespace App\Http\Controllers;

use App\Models\Pablo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PabloController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('pablos/Index', [
            'data' => Pablo::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('pablos/Upsert', [
            'data' => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pablo' => 'required|string|max:255',
        ]);
        Pablo::create($validated);

        return redirect()->route('pablo')->with('success', 'Registro creado exitosamente.');
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
        $data = Pablo::findOrFail($id);

        return Inertia::render('pablos/Upsert', [
            'data' => $data,
            'mode' => 'edit',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'pablo' => 'required|string|max:255',
        ]);
        $data = Pablo::findOrFail($id);
        $data->update($validated);

        return redirect()->route('pablo')->with('success', 'Registro actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $data = Pablo::findOrFail($id);
            $data->delete();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al eliminar: '.$e->getMessage()]);
        }

        return redirect()->route('pablo')->with('success', 'Registro eliminado exitosamente.');
    }
}

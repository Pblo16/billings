<?php

namespace App\Http\Controllers\Control;

use App\Http\Controllers\Controller;
use App\Models\Control\Clients;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('control/clients/Index', [
            'data' => Clients::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('control/clients/Upsert', [
            'data' => null
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:clients',
            'phone' => 'nullable|string|max:20|regex:/^[\d\s\-\+\(\)]+$/'
        ]);

        Clients::create($validated);

        return redirect()->route('control.clients')->with('success', 'Registro creado exitosamente.');
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
        $data = Clients::findOrFail($id);
        return Inertia::render('control/clients/Upsert', [
            'data' => $data,
            'mode' => 'edit'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:clients,name,' . $id,
            'phone' => 'nullable|string|max:20|regex:/^[\d\s\-\+\(\)]+$/'
        ]);

        $data = Clients::findOrFail($id);
        $data->update($validated);

        return redirect()->route('control.clients')->with('success', 'Registro actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $data = Clients::findOrFail($id);
            $data->delete();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al eliminar: ' . $e->getMessage()]);
        }

        return redirect()->route('control.clients')->with('success', 'Registro eliminado exitosamente.');
    }
}

<?php

namespace App\Http\Controllers\Test\Uno;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PruebaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return Inertia::render('test/uno/pruebas/Index', [
            'data' => \App\Models\Test\Uno\Prueba::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        return Inertia::render('test/uno/pruebas/Upsert');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
            ]);

            \App\Models\Test\Uno\Prueba::create([
                'name' => $validated['name'],
            ]);

            return redirect()->route('test.uno.pruebas')->with('success', 'Prueba created successfully');
        } catch (\Exception $e) {
            dd($e);
            return redirect()->back()->with('error', 'Error creating Prueba: ' . $e->getMessage());
        }
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
        //
        return Inertia::render('test/uno/pruebas/Upsert', [
            'data' => \App\Models\Test\Uno\Prueba::findOrFail($id),
            'mode' => 'edit',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
        try {
            $prueba = \App\Models\Test\Uno\Prueba::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
            ]);

            $prueba->update([
                'name' => $validated['name'],
            ]);

            return redirect()->route('test.uno.pruebas')->with('success', 'Prueba updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error updating Prueba: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
        try {
            $prueba = \App\Models\Test\Uno\Prueba::findOrFail($id);
            $prueba->delete();
            return redirect()->route('test.uno.pruebas')->with('success', 'Prueba deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error deleting Prueba: ' . $e->getMessage());
        }
    }
}

<?php

namespace App\Http\Controllers\Control;

use App\Http\Controllers\Controller;
use App\Models\Control\Departments;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('control/departments/Index', [
            'data' => Departments::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('control/departments/Upsert', [
            'data' => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments',
        ]);
        Departments::create($validated);

        return redirect()->route('control.departments')->with('success', 'Registro creado exitosamente.');
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
        $data = Departments::findOrFail($id);

        return Inertia::render('control/departments/Upsert', [
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
            'name' => 'required|string|max:255|unique:departments',
        ]);
        $data = Departments::findOrFail($id);
        $data->update($validated);

        return redirect()->route('control.departments')->with('success', 'Registro actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $data = Departments::findOrFail($id);
            $data->delete();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al eliminar: '.$e->getMessage()]);
        }

        return redirect()->route('control.departments')->with('success', 'Registro eliminado exitosamente.');
    }
}

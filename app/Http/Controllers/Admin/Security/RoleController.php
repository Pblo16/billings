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
        return Inertia::render('admin/security/roles/Index');
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
        $permissions = $request->input('permissions', []);
        $guard_name = $request->input('guard_name', 'web'); // Default to 'web' if not provided
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles',
        ]);
        $validated['guard_name'] = $guard_name;

        $role = Role::create($validated);
        $role->permissions()->sync($permissions);

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
        $data = Role::with('permissions')->findOrFail($id);

        // Add permissions array to the data
        $data->permissions_ids = $data->permissions->pluck('id')->toArray();

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
        $permissions = $request->input('permissions', []);
        $guard_name = $request->input('guard_name', 'web'); // Default to 'web' if not provided
        $validated['guard_name'] = $guard_name;

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,'.$id,
        ]);
        $data = Role::findOrFail($id);
        $data->update($validated);
        $data->permissions()->sync($permissions);

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

    public function paginated(Request $request)
    {
        $query = Role::query();

        // Handle ID-specific search (for combobox selected value retrieval)
        if ($id = $request->input('id')) {
            $query->where('id', $id);
        }

        // Handle multiple IDs search (for multi-select combobox)
        if ($ids = $request->input('ids')) {
            $idsArray = is_array($ids) ? $ids : explode(',', $ids);
            $query->whereIn('id', $idsArray);
        }

        // Apply search filter if provided
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        // Handle combobox format request
        if ($request->input('format') === 'combobox') {
            $perPage = $request->input('per_page', 10);
            $data = $query->select('id', 'name')
                ->limit($perPage)
                ->get()
                ->map(fn ($item) => [
                    'value' => (string) $item->id,
                    'label' => $item->name,
                ]);

            return response()->json($data);
        }

        // Default table format - apply sorting if provided
        if ($sortBy = $request->input('sortBy')) {
            $sortDirection = $request->input('sortDirection', 'asc');
            $query->orderBy($sortBy, $sortDirection);
        } else {
            // Default sorting
            $query->orderBy('id', 'asc');
        }

        // Paginate the results for table
        $perPage = $request->input('perPage', 10);
        $data = $query->paginate($perPage);

        return response()->json($data);
    }
}

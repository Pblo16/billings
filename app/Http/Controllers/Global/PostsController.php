<?php

namespace App\Http\Controllers\Global;

use App\Http\Controllers\Controller;
use App\Models\Global\Posts;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostsController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    return Inertia::render('global/posts/Index', [
      'data' => Posts::all()
    ]);
  }

  /**
   * Show the form for creating a new resource.
   */
  public function create()
  {
    return Inertia::render('global/posts/Upsert', [
      'data' => null
    ]);
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request)
  {
    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'slug' => 'required|string|max:255|unique:posts',
      'text' => 'nullable|string',
      'user_id' => 'required|integer'
    ]);
    Posts::create($validated);

    return redirect()->route('global.posts')->with('success', 'Registro creado exitosamente.');
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
    $data = Posts::findOrFail($id);
    return Inertia::render('global/posts/Upsert', [
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
      'name' => 'required|string|max:255',
      'slug' => 'required|string|max:255|unique:posts',
      'text' => 'nullable|string',
      'user_id' => 'required|integer'
    ]);
    $data = Posts::findOrFail($id);
    $data->update($validated);

    return redirect()->route('global.posts')->with('success', 'Registro actualizado exitosamente.');
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(string $id)
  {
    try {
      $data = Posts::findOrFail($id);
      $data->delete();
    } catch (\Exception $e) {
      return redirect()->back()->withErrors(['error' => 'Error al eliminar: ' . $e->getMessage()]);
    }

    return redirect()->route('global.posts')->with('success', 'Registro eliminado exitosamente.');
  }

  /**
   * Get paginated data for API.
   */
  public function paginated(Request $request)
  {
    $query = Posts::query();

    // Apply search filter if provided
    if ($search = $request->input('search')) {
      $query->where('name', 'like', "%{$search}%")
        ->orWhere('user_id', 'like', "%{$search}%");
    }

    // Apply sorting if provided
    if ($sortBy = $request->input('sortBy')) {
      $sortDirection = $request->input('sortDirection', 'asc');
      $query->orderBy($sortBy, $sortDirection);
    } else {
      // Default sorting
      $query->orderBy('id', 'desc');
    }

    // Paginate the results
    $perPage = $request->input('perPage', 10);
    $roles = $query->paginate($perPage);

    return response()->json($roles);
  }
}

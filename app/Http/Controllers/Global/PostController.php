<?php

namespace App\Http\Controllers\Global;

use App\Http\Controllers\Controller;
use App\Models\Global\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    return Inertia::render('global/posts/Index', [
      'data' => Post::all()
    ]);
  }

  /**
   * Show the form for creating a new resource.
   */
  public function create()
  {
    // Cargar solo 5 usuarios iniciales, el resto se cargará con búsqueda asíncrona
    $users = \App\Models\User::query()->limit(5)->get()->map(fn($user) => [
      'value' => (string)$user->id,
      'label' => $user->name
    ])->toArray();

    return Inertia::render('global/posts/Upsert', [
      'data' => null,
      'users' => $users
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
    Post::create($validated);

    return redirect()->route('global.post')->with('success', 'Registro creado exitosamente.');
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
    $data = Post::findOrFail($id);

    // Cargar solo 5 usuarios iniciales, el resto se cargará con búsqueda asíncrona
    $users = \App\Models\User::query()->limit(5)->get()->map(fn($user) => [
      'value' => (string)$user->id,
      'label' => $user->name
    ])->toArray();

    return Inertia::render('global/posts/Upsert', [
      'data' => $data,
      'users' => $users,
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
      'text' => 'nullable|string',
    ]);
    $data = Post::findOrFail($id);
    $data->update($validated);

    return redirect()->route('global.post')->with('success', 'Registro actualizado exitosamente.');
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(string $id)
  {
    try {
      $data = Post::findOrFail($id);
      $data->delete();
    } catch (\Exception $e) {
      return redirect()->back()->withErrors(['error' => 'Error al eliminar: ' . $e->getMessage()]);
    }

    return redirect()->route('global.post')->with('success', 'Registro eliminado exitosamente.');
  }

  /**
   * Search users with pagination for combobox
   */
  public function searchUsers(Request $request)
  {
    $search = $request->input('search', '');
    $perPage = $request->input('per_page', 10);

    $users = \App\Models\User::query()
      ->when($search, function ($query, $search) {
        $query->where('name', 'like', "%{$search}%")
          ->orWhere('email', 'like', "%{$search}%");
      })
      ->select('id', 'name')
      ->limit($perPage)
      ->get()
      ->map(fn($user) => [
        'value' => (string)$user->id,
        'label' => $user->name
      ]);

    return response()->json($users);
  }
}

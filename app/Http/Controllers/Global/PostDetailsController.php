<?php

namespace App\Http\Controllers\Global;

use App\Http\Controllers\Controller;
use App\Models\Global\PostDetails;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostDetailsController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    return Inertia::render('global/postdetails/Index', [
      'data' => PostDetails::all()
    ]);
  }

  /**
   * Show the form for creating a new resource.
   */
  public function create()
  {
    return Inertia::render('global/postdetails/Upsert', [
      'data' => null
    ]);
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request)
  {
    $validated = $request->validate([
      'post_id' => 'required|integer',
                'colaborator_id' => 'required|integer'
    ]);
    PostDetails::create($validated);

    return redirect()->route('global.postdetails')->with('success', 'Registro creado exitosamente.');
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
    $data = PostDetails::findOrFail($id);
    return Inertia::render('global/postdetails/Upsert', [
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
      'post_id' => 'required|integer',
                'colaborator_id' => 'required|integer'
    ]);
    $data = PostDetails::findOrFail($id);
    $data->update($validated);
        
    return redirect()->route('global.postdetails')->with('success', 'Registro actualizado exitosamente.');
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(string $id)
  {
    try {
      $data = PostDetails::findOrFail($id);
      $data->delete();
    } catch (\Exception $e) {
      return redirect()->back()->withErrors(['error' => 'Error al eliminar: ' . $e->getMessage()]);
    }

    return redirect()->route('global.postdetails')->with('success', 'Registro eliminado exitosamente.');
  }

  /**
   * Get paginated data for API.
   */
  public function paginated(Request $request)
  {
    $perPage = $request->get('perPage', 10);
    $query = PostDetails::query()->select(id, 'post_id', 'colaborator_id', created_at)->paginate($perPage);

    return response()->json($query);
  }
}
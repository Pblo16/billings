<?php

namespace App\Http\Controllers\Global;

use App\Http\Controllers\Controller;
use App\Models\Global\Posts;
use App\Traits\HandlesDocuments;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PostsController extends Controller
{
    use HandlesDocuments;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('global/posts/Index', [
            'data' => Posts::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('global/posts/Upsert', [
            'data' => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $colaborators = $request->input('colaborators', []);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:posts',
            'text' => 'nullable|string',
            'user_id' => 'required|integer',
            'article' => 'sometimes|nullable|file|mimes:pdf,doc,docx|max:20000', // max 20MB
        ]);
        $posts = Posts::create($validated);
        // Attach colaborators
        foreach ($colaborators as $colaboratorId) {
            $posts->details()->create(['colaborator_id' => $colaboratorId]);
        }

        // Handle article file upload - replace existing if present
        if ($request->hasFile('article')) {
            $this->replaceDocument(
                file: $request->file('article'),
                relatedModel: $posts,
                relationType: 'article',
                storagePath: 'articles',
                disk: config('filesystems.documents_disk')
            );
        }

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
        $data = Posts::with('details.colaborator')->findOrFail($id);

        // Transform documents to include URLs
        $transformedDocuments = $data->documents->map(function ($doc) {
            // Usar el disco almacenado en el documento
            $disk = Storage::disk($doc->disk ?? 'public');

            // Generar URL según el tipo de disco
            $url = $this->getDocumentUrl($disk, $doc);

            return [
                'id' => $doc->id,
                'name' => $doc->name,
                'path' => $doc->path,
                'url' => $url,
                'mime_type' => $doc->mime_type,
                'size' => $doc->size,
            ];
        })->toArray();
        $data = $data->toArray();
        $data['documents'] = $transformedDocuments;
        return Inertia::render('global/posts/Upsert', [
            'data' => $data,
            'mode' => 'edit',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $colaborators = $request->input('colaborators', []);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'text' => 'nullable|string',
            'user_id' => 'required|integer',
            'article' => 'sometimes|nullable|file|mimes:pdf,doc,docx|max:20000', // max 20MB
        ]);
        $data = Posts::findOrFail($id);
        $data->update($validated);

        // Sync colaborators: eliminar los existentes y agregar los nuevos
        $data->details()->delete();
        foreach ($colaborators as $colaboratorId) {
            $data->details()->create(['colaborator_id' => $colaboratorId]);
        }

        // Handle article file upload - replace existing if present
        if ($request->hasFile('article')) {
            $this->replaceDocument(
                file: $request->file('article'),
                relatedModel: $data,
                relationType: 'article',
                storagePath: 'articles',
                disk: config('filesystems.documents_disk')
            );
        }

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
        // Include colaborator relationship
        $query->with('details.colaborator');
        $query->with('user');
        // Apply search filter if provided
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('user_id', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%");
        }

        // Apply sorting if provided
        if ($sortBy = $request->input('sortBy')) {
            $sortDirection = $request->input('sortDirection', 'asc');
            $query->orderBy($sortBy, $sortDirection);
        } else {
            // Default sorting
            $query->orderBy('id', 'asc');
        }

        // Paginate the results
        $perPage = $request->input('perPage', 10);
        $posts = $query->paginate($perPage);

        return response()->json($posts);
    }

    /**
     * Delete a document from a post
     */
    public function deleteDocument(Posts $post, $documentId)
    {
        // Obtener el documento para saber qué disco usar
        $document = \App\Models\Document::find($documentId);
        $disk = $document?->disk ?? 'public';

        return $this->deleteDocumentFromModel(
            relatedModel: $post,
            documentId: $documentId,
            relationType: 'article', // Optional: filter by article type only
            disk: $disk
        );
    }
}

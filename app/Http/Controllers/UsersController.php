<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\HandlesDocuments;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UsersController extends Controller
{
    use HandlesDocuments;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return Inertia::render('users/Index');
    }

    /**
     * Display the specified resource.
     */
    public function create()
    {
        return Inertia::render('users/Upsert');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $roles = $request->input('roles', []);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'cv' => 'nullable|file|mimes:pdf|max:5120', // max 5MB
        ]);

        $model = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        $model->assignRole($roles);

        // Handle CV file upload
        if ($request->hasFile('cv')) {
            $this->uploadDocument(
                file: $request->file('cv'),
                relatedModel: $model,
                relationType: 'cv',
                storagePath: 'cvs',
                disk: config('filesystems.documents_disk')
            );
        }

        return redirect()->route('users')->with('success', 'User created successfully');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        // Load roles relationship for the user
        $user->load('roles');

        // Transform documents to include URLs
        $transformedDocuments = $user->documents->map(function ($doc) {
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

        // Replace documents collection with transformed array
        $userData = $user->toArray();
        $userData['documents'] = $transformedDocuments;
        return Inertia::render('users/Upsert', [
            'data' => $userData,
            'mode' => 'edit',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //
        $roles = $request->input('roles', []);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'nullable|string|min:8',
            'cv' => 'sometimes|nullable|file|mimes:pdf|max:15000', // max 15MB
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        // Only update password if provided
        if (! empty($validated['password'])) {
            $updateData['password'] = bcrypt($validated['password']);
        }

        $user->update($updateData);
        $user->syncRoles($roles);

        // Handle CV file upload - replace existing if present
        if ($request->hasFile('cv')) {
            $this->replaceDocument(
                file: $request->file('cv'),
                relatedModel: $user,
                relationType: 'cv',
                storagePath: 'cvs',
                disk: config('filesystems.documents_disk')
            );
        }

        return redirect()->route('users')->with('success', "User {$user->name} updated successfully");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
        try {
            $user->delete();

            return back()->with('success', "User {$user->name} deleted successfully");
        } catch (\Exception $e) {
            dd($e->getMessage());

            return back()->with('error', 'Failed to delete user: ' . $e->getMessage());
        }
    }
    /**
     * Batch delete users.
     */
    public function batchDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No user IDs provided for deletion');
        }

        User::destroy($ids);

        return back()->with('success', "Users deleted successfully");
    }

    public function paginatedUsers(Request $request)
    {
        $query = User::query();

        // Handle ID-specific search (for combobox selected value retrieval)
        if ($id = $request->input('id')) {
            $query->where('id', $id);
        }

        // Apply search filter if provided
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        }

        // Handle combobox format request
        if ($request->input('format') === 'combobox') {
            $perPage = $request->input('per_page', 10);
            $data = $query->select('id', 'name')
                ->limit($perPage)
                ->get()
                ->map(fn($item) => [
                    'value' => (string) $item->id,
                    'label' => $item->name,
                ]);

            return response()->json($data);
        }

        // Default table format - sorting is handled on frontend
        // Just return data with default ordering by id
        $query->orderBy('id', 'asc');

        if ($request->input('posts') === 'all') {
            $query->with('posts', 'colaboratedPosts');
        }
        if ($request->input('colaborator') === 'all') {
            $query->with('colaboratedPosts');
        }
        if ($request->input('roles') === 'all') {
            $query->with('roles');
        }
        if ($request->input('documents') === 'all') {
            $query->with('documents');
        }

        // Paginate the results for table
        $perPage = $request->input('perPage', 10);
        $data = $query->paginate($perPage);

        return response()->json($data);
    }

    /**
     * Delete a document from a user
     */
    public function deleteDocument(User $user, $documentId)
    {
        // Obtener el documento para saber qué disco usar
        $document = \App\Models\Document::find($documentId);
        $disk = $document?->disk ?? 'public';

        return $this->deleteDocumentFromModel(
            relatedModel: $user,
            documentId: $documentId,
            relationType: 'cv', // Optional: filter by CV type only
            disk: $disk
        );
    }
}

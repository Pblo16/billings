<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UsersController extends Controller
{
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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        return redirect()->route('users')->with('success', 'User created successfully');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        return Inertia::render('users/Upsert', [
            'data' => $user,
            'mode' => 'edit',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'nullable|string|min:8',
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

        return redirect()->route('users')->with('success', "User {$user->id} updated successfully");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
        try {
            $user->delete();

            return back()->with('success', 'User deleted successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete user: ' . $e->getMessage());
        }
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
            $users = $query->select('id', 'name')
                ->limit($perPage)
                ->get()
                ->map(fn($user) => [
                    'value' => (string) $user->id,
                    'label' => $user->name,
                ]);

            return response()->json($users);
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
        $users = $query->paginate($perPage);

        return response()->json($users);
    }
}

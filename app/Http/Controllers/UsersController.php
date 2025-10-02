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
        return Inertia::render('users/Index', [
            'data' => User::all(),
        ]);
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

            return redirect()->route('users')->with('success', 'User deleted successfully');
        } catch (\Exception $e) {
            // Log the exception or handle it as needed
            return redirect()->route('users')->with('error', 'Failed to delete user: '.$e->getMessage());
        }
    }

    public function data(Request $request)
    {
        $query = User::query()->select('id', 'name', 'email', 'created_at')->paginate($request->get('perPage', 10));

        return response()->json($query);
    }
}

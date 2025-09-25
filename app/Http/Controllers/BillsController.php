<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillsController extends Controller
{
    public function index() {}

    public function create()
    {
        return Inertia::render('bills/Create');
    }

    public function edit(User $user)
    {
        // TODO: Implement your processing logic here
        // Example: $user->update([...]); or dispatch a job

        return Inertia::render('bills/Edit', [
            'data' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ]);

        $user->update([
            'name' => $validated['username'],
            'email' => $validated['email'],
        ]);

        return redirect()->route('bills')->with('success', "User {$user->id} updated successfully");
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
        ]);

        User::create([
            'name' => $validated['username'],
            'email' => $validated['email'],
            'password' => bcrypt('password'), // Default password, should be changed later
        ]);

        return redirect()->route('bills')->with('success', 'User created successfully');
    }

}

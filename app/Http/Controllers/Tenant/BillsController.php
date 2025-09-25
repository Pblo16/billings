<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillsController extends Controller
{
    public function index()
    {
        return Inertia::render('bills/Index', [
            'data' => User::all()
        ]);
    }

    public function process(User $user, Request $request)
    {
        // TODO: Implement your processing logic here
        // Example: $user->update([...]); or dispatch a job

        return back()->with('success', "Processed user {$user->id}");
    }
}

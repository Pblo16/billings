<?php

use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Define specific routes before apiResource to avoid conflicts
    Route::get('/users/create', [UsersController::class, 'create'])->name('users.create');
    Route::get('/users/edit/{user}', [UsersController::class, 'edit'])->name('users.edit');
    Route::apiResource('users', UsersController::class)->name('index', 'users');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

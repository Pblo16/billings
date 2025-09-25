<?php

use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home')->middleware(['universal', InitializeTenancyByDomain::class]);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard')->middleware(['universal', InitializeTenancyByDomain::class]);

    // Define specific routes before apiResource to avoid conflicts
    Route::get('/users/create', [UsersController::class, 'create'])->name('users.create')->middleware(['universal', InitializeTenancyByDomain::class]);
    Route::get('/users/edit/{user}', [UsersController::class, 'edit'])->name('users.edit')->middleware(['universal', InitializeTenancyByDomain::class]);
    Route::apiResource('users', UsersController::class)->name('index', 'users')->middleware(['universal', InitializeTenancyByDomain::class]);
});



require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

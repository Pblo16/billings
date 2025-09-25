<?php

use App\Http\Controllers\TenantController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;

// Apply tenant middleware group to all routes
Route::middleware(['tenant'])->group(function () {
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
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Define specific routes before apiResource to avoid conflicts
    Route::get('/tenants/create', [TenantController::class, 'create'])->name('tenants.create');
    Route::get('/tenants/edit/{tenant}', [TenantController::class, 'edit'])->name('tenants.edit');
    Route::apiResource('tenants', TenantController::class)->name('index', 'tenants');
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

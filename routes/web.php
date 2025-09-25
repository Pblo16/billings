<?php

use App\Http\Controllers\BillsController;
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

    Route::get('/bills', [BillsController::class, 'index'])->name('bills')->middleware(['universal', InitializeTenancyByDomain::class]);
});



require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

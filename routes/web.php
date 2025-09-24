<?php

use App\Http\Controllers\BillsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/bills', [BillsController::class, 'index'])->name('bills');
    Route::post('/bills/{user}/process', [BillsController::class, 'process'])->name('bills.process');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

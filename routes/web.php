<?php

use App\Http\Controllers\Test\Uno\PruebaController;
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

    Route::resource('users', UsersController::class)->names([
        'index' => 'users',
        'create' => 'users.create',
        'store' => 'users.store',
        'show' => 'users.show',
        'edit' => 'users.edit',
        'update' => 'users.update',
        'destroy' => 'users.destroy'
    ]);
    Route::resource('test/uno/pruebas', PruebaController::class)->names([
        'index' => 'test.uno.pruebas',
        'create' => 'test.uno.pruebas.create',
        'store' => 'test.uno.pruebas.store',
        'show' => 'test.uno.pruebas.show',
        'edit' => 'test.uno.pruebas.edit',
        'update' => 'test.uno.pruebas.update',
        'destroy' => 'test.uno.pruebas.destroy'
    ]);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

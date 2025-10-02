<?php

use App\Http\Controllers\Admin\Security\RoleController;
use App\Http\Controllers\Control\ClientsController;
use App\Http\Controllers\Control\DepartmentsController;
use App\Http\Controllers\Control\ProviderController;
use App\Http\Controllers\Global\PostController;
use App\Http\Controllers\PabloController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Global\PostsController;

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
        'destroy' => 'users.destroy',
    ]);

    Route::resource('admin/security/role', RoleController::class)->names([
        'index' => 'admin.security.role',
        'create' => 'admin.security.role.create',
        'store' => 'admin.security.role.store',
        'show' => 'admin.security.role.show',
        'edit' => 'admin.security.role.edit',
        'update' => 'admin.security.role.update',
        'destroy' => 'admin.security.role.destroy',
    ]);

    Route::resource('global/posts', PostsController::class)->names([
        'index' => 'global.posts',
        'create' => 'global.posts.create',
        'store' => 'global.posts.store',
        'show' => 'global.posts.show',
        'edit' => 'global.posts.edit',
        'update' => 'global.posts.update',
        'destroy' => 'global.posts.destroy'
    ]);
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

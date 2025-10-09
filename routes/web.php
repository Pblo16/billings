<?php

use App\Http\Controllers\Admin\Security\RoleController;
use App\Http\Controllers\Global\PostsController;
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

    Route::delete('users/batch-delete', [UsersController::class, 'batchDelete'])->name('users.batchDelete');
    Route::delete('users/{user}/documents/{document}', [UsersController::class, 'deleteDocument'])->name('users.documents.delete');

    Route::resource('users', UsersController::class)->names([
        'index' => 'users',
        'create' => 'users.create',
        'store' => 'users.store',
        'show' => 'users.show',
        'edit' => 'users.edit',
        'update' => 'users.update',
        'destroy' => 'users.destroy',
    ]);

    Route::delete('admin/security/role/batch-delete', [RoleController::class, 'batchDelete'])->name('admin.security.role.batchDelete');

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
        'destroy' => 'global.posts.destroy',

    ]);
    Route::delete('global/posts/{post}/documents/{document}', [PostsController::class, 'deleteDocument'])->name('posts.documents.delete');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

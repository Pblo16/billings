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

    Route::resource('control/provider', ProviderController::class)->names([
        'index' => 'control.provider',
        'create' => 'control.provider.create',
        'store' => 'control.provider.store',
        'show' => 'control.provider.show',
        'edit' => 'control.provider.edit',
        'update' => 'control.provider.update',
        'destroy' => 'control.provider.destroy',
    ]);

    Route::resource('control/clients', ClientsController::class)->names([
        'index' => 'control.clients',
        'create' => 'control.clients.create',
        'store' => 'control.clients.store',
        'show' => 'control.clients.show',
        'edit' => 'control.clients.edit',
        'update' => 'control.clients.update',
        'destroy' => 'control.clients.destroy',
    ]);

    Route::resource('control/departments', DepartmentsController::class)->names([
        'index' => 'control.departments',
        'create' => 'control.departments.create',
        'store' => 'control.departments.store',
        'show' => 'control.departments.show',
        'edit' => 'control.departments.edit',
        'update' => 'control.departments.update',
        'destroy' => 'control.departments.destroy',
    ]);

    Route::resource('pablo', PabloController::class)->names([
        'index' => 'pablo',
        'create' => 'pablo.create',
        'store' => 'pablo.store',
        'show' => 'pablo.show',
        'edit' => 'pablo.edit',
        'update' => 'pablo.update',
        'destroy' => 'pablo.destroy',
    ]);
    Route::resource('global/post', PostController::class)->names([
        'index' => 'global.post',
        'create' => 'global.post.create',
        'store' => 'global.post.store',
        'show' => 'global.post.show',
        'edit' => 'global.post.edit',
        'update' => 'global.post.update',
        'destroy' => 'global.post.destroy'
    ]);
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

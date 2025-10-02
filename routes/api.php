<?php

use App\Http\Controllers\Admin\Security\RoleController;
use App\Http\Controllers\UsersController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Global\PostController;
use App\Http\Controllers\Global\PostsController;


Route::middleware(['auth:sanctum', 'web'])->group(
    function () {
        // Define your API routes here
        Route::get('/users/paginated', [UsersController::class, 'paginatedUsers'])->name('api.users.paginated');
        Route::get('/global/posts/paginated', [PostsController::class, 'paginated'])->name('api.global.posts.paginated');
        Route::get('/security/roles/paginated', [RoleController::class, 'paginated'])->name('api.security.roles.paginated');
    }
);

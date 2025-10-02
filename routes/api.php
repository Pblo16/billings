<?php

use App\Http\Controllers\UsersController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Global\PostController;


Route::middleware(['auth:sanctum', 'web'])->group(
    function () {
        // Define your API routes here
        Route::get('/users/searcheable', [UsersController::class, 'searchUsers'])->name('api.users.data');
        Route::get('/users/paginated', [UsersController::class, 'paginatedUsers'])->name('api.users.paginated');
        Route::get('/global/post/paginated', [PostController::class, 'paginated'])->name('api.global.post.paginated');
    }
);

<?php

namespace App\Models\Global;

use Illuminate\Database\Eloquent\Model;

class Posts extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'text',
        'user_id',
    ];

    //
}

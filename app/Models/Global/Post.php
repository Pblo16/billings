<?php

namespace App\Models\Global;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'text',
        'user_id',
    ];

    //
}

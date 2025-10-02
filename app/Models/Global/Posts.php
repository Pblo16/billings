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
        'colaborator',
    ];

    //
    public function colaborator()
    {
        return $this->belongsTo(\App\Models\User::class, 'colaborator');
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }
}

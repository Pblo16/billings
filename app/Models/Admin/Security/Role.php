<?php

namespace App\Models\Admin\Security;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'name',
        'guard_name',
    ];

    //
}

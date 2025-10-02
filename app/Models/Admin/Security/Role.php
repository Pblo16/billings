<?php

namespace App\Models\Admin\Security;

use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    protected $fillable = [
        'name',
        'guard_name',
    ];

    /**
     * Get all permissions for this role as an array of IDs
     */
    public function getPermissionIdsAttribute()
    {
        return $this->permissions->pluck('id')->toArray();
    }
}

<?php

namespace App\Http\Controllers\Admin\Security;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class Permissions extends Controller
{
    //
    public function index(Request $request)
    {
        $query = Permission::query()->select('id', 'name', 'guard_name');

        // Apply search filter if provided
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        // Default sorting
        $query->orderBy('name', 'asc');

        // Get all permissions
        $permissions = $query->get();

        // Group permissions by category (suffix after first underscore)
        $grouped = [];
        foreach ($permissions as $permission) {
            // Extract category from permission name (e.g. "view_user" => "User")
            if (strpos($permission->name, '_') !== false) {
                [$action, $entity] = explode('_', $permission->name, 2);
                $category = ucfirst(str_replace('_', ' ', $entity));
            } else {
                $category = 'Other';
            }

            if (!isset($grouped[$category])) {
                $grouped[$category] = [];
            }
            $grouped[$category][] = $permission;
        }

        // Transform to array of PermissionGroup objects
        $result = [];
        foreach ($grouped as $category => $perms) {
            $result[] = [
                'category' => $category,
                'permissions' => $perms
            ];
        }

        return response()->json($result);
    }
}

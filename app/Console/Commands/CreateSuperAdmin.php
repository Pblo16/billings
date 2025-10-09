<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;

class CreateSuperAdmin extends Command
{
    protected $signature = 'create:super-admin {email}';

    protected $description = 'Create a super-admin user and assign the super-admin role';

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("User with email {$email} not found.");

            return;
        }

        $role = Role::firstOrCreate(['name' => 'super-admin']);
        $user->assignRole($role);

        $this->info("User {$email} has been assigned the super-admin role.");
    }
}

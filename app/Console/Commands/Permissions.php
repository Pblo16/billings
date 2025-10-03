<?php

namespace App\Console\Commands;

use Dotenv\Store\File\Paths;
use Illuminate\Console\Command;

class Permissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:permissions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $modelFiles = [];

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator(app_path('Models'))
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === 'php') {
                $modelFiles[] = $file->getPathname();
            }
        }

        $models = array_map(function ($file) {
            return pathinfo($file, PATHINFO_FILENAME);
        }, $modelFiles);

        $models = array_filter($models, function ($model) {
            return stripos($model, 'Detail') === false;
        });
        info($models);

        foreach ($models as $model) {
            $permission = strtolower($model);
            $this->info("Creating permissions for model: $model");

            // Create permissions
            $permissions = [
                "view_$permission",
                "create_$permission",
                "edit_$permission",
                "delete_$permission",
            ];

            foreach ($permissions as $perm) {
                // Check if permission already exists
                if (\Spatie\Permission\Models\Permission::where('name', $perm)->exists()) {
                    $this->info("Permission '$perm' already exists. Skipping.");
                    continue;
                }

                \Spatie\Permission\Models\Permission::create(['name' => $perm]);
                $this->info("Permission '$perm' created.");
            }
        }
    }
}

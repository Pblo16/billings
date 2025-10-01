<?php

namespace App\Console\Commands;

use App\Console\Commands\Services\ControllerGenerator;
use App\Console\Commands\Services\FieldManager;
use App\Console\Commands\Services\MigrationUpdater;
use App\Console\Commands\Services\NameResolver;
use App\Console\Commands\Services\ReactFileGenerator;
use Illuminate\Console\Command;

class MakeInertiaCrud extends Command
{
    protected $signature = 'make:inertia {name}';
    protected $description = 'Crea modelo, controlador y vistas para Inertia';

    public function handle(): void
    {
        // Resolver nombres y rutas
        $nameResolver = new NameResolver($this->argument('name'));
        $config = $nameResolver->resolve();

        // Crear instancias de servicios
        $fieldManager = new FieldManager($this);
        $migrationUpdater = new MigrationUpdater($this);
        $controllerGenerator = new ControllerGenerator($this, $fieldManager);
        $reactFileGenerator = new ReactFileGenerator($this, $fieldManager);

        // Solicitar campos para la migración
        $fields = $fieldManager->askForFields();

        // Crear modelo + migración
        $this->call('make:model', ['name' => $config['modelWithPath'], '-m' => true]);

        // Modificar archivos si hay campos
        if (!empty($fields)) {
            $migrationUpdater->updateMigration($config['model'], $fields);
            $migrationUpdater->updateModelFillable($config['model'], $config['parentPath'], $fields);
            $migrationUpdater->addTypesToIndexFile($config['name'], $fields);
        }

        // Crear controlador
        $controllerGenerator->createController($config, $fields);

        // Generar archivos React
        $reactFileGenerator->generateReactFiles($config, $fields);

        $this->info("✅ Modelo {$config['model']}, controlador {$config['controller']} y vistas Inertia creadas exitosamente");
    }
}

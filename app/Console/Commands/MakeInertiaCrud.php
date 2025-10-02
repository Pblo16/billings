<?php

namespace App\Console\Commands;

use App\Console\Commands\Services\ControllerGenerator;
use App\Console\Commands\Services\FieldManager;
use App\Console\Commands\Services\MigrationUpdater;
use App\Console\Commands\Services\NameResolver;
use App\Console\Commands\Services\ReactFileGenerator;
use App\Console\Commands\Services\RouteGenerator;
use Illuminate\Console\Command;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\info;
use function Laravel\Prompts\multiselect;
use function Laravel\Prompts\note;
use function Laravel\Prompts\text;

class MakeInertiaCrud extends Command
{
    protected $signature = 'make:inertia {name?}';

    protected $description = 'Create model, controller and Inertia views with CRUD operations';

    public function handle(): void
    {
        // Preguntar por el nombre si no se proporcionó
        $name = $this->argument('name');

        if (! $name) {
            note('You can organize your files using paths:'.PHP_EOL.'• Simple: Role'.PHP_EOL.'• Nested: Admin/Role'.PHP_EOL.'• Deep: Example/Components/Component');
            $this->newLine();

            $name = text(
                label: 'What is the name of your model?',
                placeholder: 'E.g. Role, Admin/Role, Example/Components/Component',
                required: true,
                validate: fn ($value) => $this->validateModelName($value)
            );
        }

        // Preguntar qué componentes generar
        $this->newLine();
        $components = multiselect(
            label: 'What would you like to generate?',
            options: [
                'all' => 'All (Model, Migration, Controller, Views, Routes)',
                'model' => 'Model',
                'migration' => 'Migration',
                'controller' => 'Controller',
                'views' => 'Inertia Views',
                'routes' => 'Routes (web.php)',
            ],
            default: ['all'],
            required: true,
            hint: 'Use space to select, enter to confirm'
        );

        // Si se selecciona "all", incluir todos los componentes
        if (in_array('all', $components)) {
            $components = ['model', 'migration', 'controller', 'views', 'routes'];
        }

        // Resolver nombres y rutas
        $nameResolver = new NameResolver($name);
        $config = $nameResolver->resolve();

        // Crear instancias de servicios
        $fieldManager = new FieldManager($this, $config['pluralLower']);
        $migrationUpdater = new MigrationUpdater($this);
        $controllerGenerator = new ControllerGenerator($this, $fieldManager);
        $reactFileGenerator = new ReactFileGenerator($this, $fieldManager);
        $routeGenerator = new RouteGenerator($this);

        // Solicitar campos SOLO si se va a crear o modificar la migración
        $fields = [];
        $isAddingColumns = false;
        if (in_array('migration', $components)) {
            // Verificar si la migración ya existe
            $existingMigration = $migrationUpdater->findMigration($config['model']);

            if ($existingMigration) {
                $this->newLine();
                info("Migration for {$config['model']} already exists!");
                $isAddingColumns = confirm(
                    label: 'Do you want to create a new migration to add fields?',
                    default: true
                );

                if ($isAddingColumns) {
                    note('A new migration will be created to add columns to the table.');
                    $this->newLine();
                    $fields = $fieldManager->askForFields();
                }
            } else {
                // Nueva migración (crear tabla)
                $fields = $fieldManager->askForFields();
            }
        }

        // Crear modelo + migración
        if (in_array('model', $components)) {
            $migrationOption = in_array('migration', $components) && ! $isAddingColumns ? ['-m' => true] : [];
            $this->call('make:model', array_merge(['name' => $config['modelWithPath']], $migrationOption));
        } elseif (in_array('migration', $components) && ! $isAddingColumns) {
            // Solo crear migración sin modelo (si no existe)
            $this->call('make:migration', ['name' => 'create_'.strtolower($config['model']).'s_table']);
        }

        // Si estamos agregando columnas, crear migración tipo "add_columns"
        if ($isAddingColumns && ! empty($fields)) {
            $tableName = \Illuminate\Support\Str::snake(\Illuminate\Support\Str::plural($config['model']));
            $fieldNames = implode('_and_', array_map(fn ($f) => $f['name'], array_slice($fields, 0, 3)));
            if (count($fields) > 3) {
                $fieldNames .= '_etc';
            }
            $migrationName = "add_{$fieldNames}_to_{$tableName}_table";
            $this->call('make:migration', ['name' => $migrationName, '--table' => $tableName]);
        }

        // Modificar archivos si hay campos
        if (! empty($fields)) {
            // Actualizar migración
            if (in_array('migration', $components) || $isAddingColumns) {
                if ($isAddingColumns) {
                    // Para migración de agregar columnas, usar un método diferente
                    $migrationUpdater->updateAddColumnsMigration($config['model'], $fields);
                } else {
                    // Para migración de crear tabla
                    $migrationUpdater->updateMigration($config['model'], $fields);
                }
            }

            // Actualizar modelo con fillable (ya sea nuevo o existente)
            if (in_array('model', $components) || $isAddingColumns) {
                $migrationUpdater->updateModelFillable($config['model'], $config['parentPath'], $fields, $isAddingColumns);
            }

            // Actualizar tipos TypeScript (ya sea nuevo o agregar campos)
            if (in_array('views', $components) || $isAddingColumns) {
                $migrationUpdater->addTypesToIndexFile($config['name'], $fields, $isAddingColumns);
            }
        }

        // Crear controlador (solo si se solicita o si se están agregando columnas)
        if (in_array('controller', $components)) {
            $controllerGenerator->createController($config, $fields);
        } elseif ($isAddingColumns && ! empty($fields)) {
            // Si estamos agregando columnas, preguntar si desea actualizar el controlador
            if (file_exists(app_path("Http/Controllers/{$config['controllerPath']}/{$config['controller']}.php"))) {
                $this->newLine();
                if (confirm('Do you want to update the existing controller with new fields?', true)) {
                    $controllerGenerator->createController($config, $fields);
                }
            }
        }

        // Generar archivos React (solo si se solicita o si se están agregando columnas)
        if (in_array('views', $components)) {
            $reactFileGenerator->generateReactFiles($config, $fields);
        } elseif ($isAddingColumns && ! empty($fields)) {
            // Si estamos agregando columnas, preguntar si desea actualizar las vistas
            $indexPagePath = resource_path("js/pages/{$config['frontendPath']}/Index.tsx");
            if (file_exists($indexPagePath)) {
                $this->newLine();
                if (confirm('Do you want to update the existing React views with new fields?', true)) {
                    $reactFileGenerator->generateReactFiles($config, $fields);
                }
            }
        }

        // Generar rutas
        if (in_array('routes', $components)) {
            $routeGenerator->addRouteToWeb($config);
        }

        // Mensaje de éxito
        $generated = [];
        $updated = [];

        if ($isAddingColumns) {
            $generated[] = 'Migration (add columns)';
            if (! empty($fields)) {
                $updated[] = 'Model $fillable';
                $updated[] = 'TypeScript types';
            }
        } else {
            if (in_array('model', $components)) {
                $generated[] = 'Model';
            }
            if (in_array('migration', $components)) {
                $generated[] = 'Migration';
            }
            if (in_array('controller', $components)) {
                $generated[] = 'Controller';
            }
            if (in_array('views', $components)) {
                $generated[] = 'Inertia Views';
            }
            if (in_array('routes', $components)) {
                $generated[] = 'Routes';
            }
        }

        // Ejecutar migraciones
        if (in_array('migration', $components) || $isAddingColumns) {
            $this->newLine();
            $this->call('migrate');
        }

        $this->newLine();
        if (! empty($generated)) {
            info('✅ '.implode(', ', $generated).' created successfully!');
        }
        if (! empty($updated)) {
            info('✅ '.implode(', ', $updated).' updated successfully!');
        }

        if (empty($generated) && empty($updated)) {
            info('✅ Operation completed successfully!');
        }
    }

    private function validateModelName(?string $value): ?string
    {
        if (empty($value)) {
            return 'Model name is required';
        }

        // Validar cada parte del path
        $parts = explode('/', $value);

        foreach ($parts as $part) {
            if (empty($part)) {
                return 'Empty path segments are not allowed';
            }

            if (! preg_match('/^[A-Z][a-zA-Z0-9]*$/', $part)) {
                return "'{$part}' must start with an uppercase letter and contain only letters and numbers";
            }
        }

        return null;
    }
}

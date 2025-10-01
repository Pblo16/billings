<?php

namespace App\Console\Commands;

use App\Console\Commands\Services\ControllerGenerator;
use App\Console\Commands\Services\FieldManager;
use App\Console\Commands\Services\MigrationUpdater;
use App\Console\Commands\Services\NameResolver;
use App\Console\Commands\Services\ReactFileGenerator;
use App\Console\Commands\Services\RouteGenerator;
use Illuminate\Console\Command;

use function Laravel\Prompts\text;
use function Laravel\Prompts\note;
use function Laravel\Prompts\info;
use function Laravel\Prompts\multiselect;
use function Pest\Laravel\call;

class MakeInertiaCrud extends Command
{
    protected $signature = 'make:inertia {name?}';
    protected $description = 'Create model, controller and Inertia views with CRUD operations';

    public function handle(): void
    {
        // Preguntar por el nombre si no se proporcionó
        $name = $this->argument('name');

        if (!$name) {
            note('You can organize your files using paths:' . PHP_EOL . '• Simple: Role' . PHP_EOL . '• Nested: Admin/Role' . PHP_EOL . '• Deep: Example/Components/Component');
            $this->newLine();

            $name = text(
                label: 'What is the name of your model?',
                placeholder: 'E.g. Role, Admin/Role, Example/Components/Component',
                required: true,
                validate: fn($value) => $this->validateModelName($value)
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
        $fieldManager = new FieldManager($this);
        $migrationUpdater = new MigrationUpdater($this);
        $controllerGenerator = new ControllerGenerator($this, $fieldManager);
        $reactFileGenerator = new ReactFileGenerator($this, $fieldManager);
        $routeGenerator = new RouteGenerator($this);

        // Solicitar campos para la migración si se va a generar migración
        $fields = [];
        if (in_array('migration', $components) || in_array('controller', $components) || in_array('views', $components)) {
            $fields = $fieldManager->askForFields();
        }

        // Crear modelo + migración
        if (in_array('model', $components)) {
            $migrationOption = in_array('migration', $components) ? ['-m' => true] : [];
            $this->call('make:model', array_merge(['name' => $config['modelWithPath']], $migrationOption));
        } elseif (in_array('migration', $components)) {
            // Solo crear migración sin modelo
            $this->call('make:migration', ['name' => 'create_' . strtolower($config['model']) . 's_table']);
        }

        // Modificar archivos si hay campos y migración
        if (!empty($fields) && in_array('migration', $components)) {
            $migrationUpdater->updateMigration($config['model'], $fields);

            if (in_array('model', $components)) {
                $migrationUpdater->updateModelFillable($config['model'], $config['parentPath'], $fields);
            }

            if (in_array('views', $components)) {
                $migrationUpdater->addTypesToIndexFile($config['name'], $fields);
            }
        }

        // Crear controlador
        if (in_array('controller', $components)) {
            $controllerGenerator->createController($config, $fields);
        }

        // Generar archivos React
        if (in_array('views', $components)) {
            $reactFileGenerator->generateReactFiles($config, $fields);
        }

        // Generar rutas
        if (in_array('routes', $components)) {
            $routeGenerator->addRouteToWeb($config);
        }

        // Mensaje de éxito
        $generated = [];
        if (in_array('model', $components)) $generated[] = 'Model';
        if (in_array('migration', $components)) $generated[] = 'Migration';
        if (in_array('controller', $components)) $generated[] = 'Controller';
        if (in_array('views', $components)) $generated[] = 'Inertia Views';
        if (in_array('routes', $components)) $generated[] = 'Routes';

        $this->call('migrate');

        info(implode(', ', $generated) . ' created successfully!');
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

            if (!preg_match('/^[A-Z][a-zA-Z0-9]*$/', $part)) {
                return "'{$part}' must start with an uppercase letter and contain only letters and numbers";
            }
        }

        return null;
    }
}

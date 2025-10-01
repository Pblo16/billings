<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class MakeInertiaCrud extends Command
{
    protected $signature = 'make:inertia {name}';
    protected $description = 'Crea modelo, controlador y vistas para Inertia';

    public function handle(): void
    {
        // Normalizar separadores y dividir en segmentos
        $raw = str_replace('\\', '/', $this->argument('name'));
        $segments = array_values(array_filter(explode('/', $raw)));

        // Extraer último segmento (modelo) y construir la ruta padre sin el último segmento
        $modelSegment = array_pop($segments);
        $parentPath = implode('/', $segments); // "Admin/Security" o "" si no hay padre
        $parentPathLower = Str::lower($parentPath);
        // Modelo/Nombre/Controller habituales (usar $modelSegment como nombre base)
        $model       = Str::studly($modelSegment);
        $controller  = "{$model}Controller";
        $plural      = Str::pluralStudly($model);
        $pluralLower = Str::lower($plural);
        $modelLower  = Str::lower($model);
        $name        = class_basename($model);
        $nameLower   = Str::lower($name);

        // Ejemplo: si quieres usar la ruta padre para vistas => resources/js/pages/Admin/Security/roles
        $viewFolder = ($parentPath !== '') ? "{$parentPathLower}/{$pluralLower}" : $pluralLower;
        $viewPath = resource_path("js/pages/{$viewFolder}");

        // Solicitar campos para la migración
        $fields = $this->askForFields();

        // Crear modelo + migración
        $this->call('make:model', ['name' => $model, '-m' => true]);

        // Modificar la migración con los campos solicitados
        if (!empty($fields)) {
            $this->updateMigration($model, $fields);
            $this->updateModelFillable($model, $fields);
            $this->addTypesToIndexFile($name, $fields);
        }

        // Crear controlador personalizado
        $this->createController($model, $controller, $pluralLower, $fields);

        // Crear directorio de vistas Inertia si no existe
        if (! is_dir($viewPath)) {
            mkdir($viewPath, 0755, true);
        }

        // Archivos a generar con sus respectivos stubs
        $files = [
            'columns.tsx'      => "{$viewPath}/columns.tsx",
            'Index.tsx'        => "{$viewPath}/Index.tsx",
            'Upsert.tsx'       => "{$viewPath}/Upsert.tsx",
            'Form.tsx'         => "{$viewPath}/" . $name . "Form.tsx",
        ];

        // Reemplazos comunes
        $replacements = [
            'name'        => $name,
            'plural'      => $plural,
            'pluralLower' => $pluralLower,
            'model'       => $model,
            'modelLower'  => $modelLower,
            'nameLower'   => $nameLower,
            'parentPath'  => $parentPath,
            'parentPathLower' => $parentPathLower,
        ];

        // Generar código de campos para React
        if (!empty($fields)) {
            $replacements['zodSchema'] = $this->generateZodSchema($fields);
            $replacements['formFieldsConfig'] = $this->generateFormFieldsConfig($fields);
            $replacements['defaultValues'] = $this->generateDefaultValues($fields);
        }

        foreach ($files as $stub => $path) {
            $this->makeReactFile($path, $stub, $replacements);
        }

        $this->info("✅ Modelo {$model}, controlador {$controller} y vistas Inertia creadas en {$viewPath}");
    }

    protected function makeReactFile(string $path, string $stub, array $replacements): void
    {
        $stubPath = base_path("stubs/inertia/{$stub}.stub");

        if (! file_exists($stubPath)) {
            $this->error("❌ No se encontró el stub: {$stubPath}");
            return;
        }

        $content = file_get_contents($stubPath);

        foreach ($replacements as $search => $replace) {
            $content = str_replace("{{{$search}}}", $replace, $content);
        }

        file_put_contents($path, $content);

        $this->line("📄 Creado: {$path}");
    }

    protected function askForFields(): array
    {
        $fields = [];
        $this->info('📝 Ahora vamos a definir los campos del modelo (presiona Enter sin escribir nada para terminar)');

        $fieldTypes = [
            'string',
            'text',
            'integer',
            'bigInteger',
            'boolean',
            'date',
            'datetime',
            'timestamp',
            'decimal',
            'float',
            'json',
            'foreignId',
        ];

        while (true) {
            $fieldName = $this->ask('Nombre del campo (o Enter para terminar)');

            if (empty($fieldName)) {
                break;
            }

            $fieldType = $this->choice(
                "Tipo de dato para '{$fieldName}'",
                $fieldTypes,
                0
            );

            $nullable = $this->confirm("¿El campo '{$fieldName}' puede ser nulo?", false);

            $fields[] = [
                'name' => $fieldName,
                'type' => $fieldType,
                'nullable' => $nullable,
            ];

            $this->info("✅ Campo '{$fieldName}' ({$fieldType}) agregado");
        }

        return $fields;
    }

    protected function updateMigration(string $model, array $fields): void
    {
        // Buscar el archivo de migración más reciente
        $migrationPath = database_path('migrations');
        $modelBaseName = class_basename($model);
        $files = glob("{$migrationPath}/*_create_" . Str::snake(Str::plural($modelBaseName)) . "_table.php");

        if (empty($files)) {
            $this->error('❌ No se encontró el archivo de migración');
            return;
        }

        $migrationFile = end($files);
        $content = file_get_contents($migrationFile);

        // Generar código de campos
        $fieldsCode = '';
        foreach ($fields as $field) {
            $line = "\$table->{$field['type']}('{$field['name']}')";

            if ($field['nullable']) {
                $line .= '->nullable()';
            }

            $line .= ';';
            $fieldsCode .= str_repeat(' ', 12) . $line . "\n";
        }

        // Buscar el lugar donde insertar los campos (después de $table->id())
        $pattern = '/(\$table->id\(\);)/';
        $replacement = "$1\n{$fieldsCode}";

        $content = preg_replace($pattern, $replacement, $content);

        file_put_contents($migrationFile, $content);

        $this->info("✅ Migración actualizada con los campos definidos");
    }

    protected function updateModelFillable(string $model, array $fields): void
    {
        $modelPath = app_path("Models/{$model}.php");

        if (!file_exists($modelPath)) {
            $this->error("❌ No se encontró el modelo en {$modelPath}");
            return;
        }

        $content = file_get_contents($modelPath);

        // Generar array de campos fillable
        $fillableFields = array_map(fn($field) => "'{$field['name']}'", $fields);
        $fillableString = "[\n        " . implode(",\n        ", $fillableFields) . ",\n    ]";

        // Buscar el lugar donde insertar fillable (después de "class NombreModelo extends Model")
        $modelBaseName = class_basename($model);
        $pattern = '/(class\s+' . preg_quote($modelBaseName, '/') . '\s+extends\s+Model\s*\{)/';
        $fillableCode = "\n    protected \$fillable = {$fillableString};\n";

        $content = preg_replace_callback($pattern, function ($matches) use ($fillableCode) {
            return $matches[0] . $fillableCode;
        }, $content);

        file_put_contents($modelPath, $content);

        $this->info("✅ Modelo actualizado con \$fillable");
    }

    protected function addTypesToIndexFile(string $name, array $fields): void
    {
        $indexFile = resource_path('js/types/index.d.ts');

        if (!file_exists($indexFile)) {
            $this->error("❌ No se encontró el archivo index.d.ts");
            return;
        }

        $content = file_get_contents($indexFile);

        // Generar tipos TypeScript
        $typeDefinitions = '';
        foreach ($fields as $field) {
            $tsType = $this->mapPhpTypeToTypeScript($field['type']);
            $optional = $field['nullable'] ? '?' : '';
            $typeDefinitions .= "    {$field['name']}{$optional}: {$tsType};\n";
        }

        $newTypes = <<<TS

export interface {$name} {
    id: number;
{$typeDefinitions}    created_at?: string;
    updated_at?: string;
}

export interface {$name}Form {
{$typeDefinitions}}
TS;

        // Agregar los tipos al final del archivo
        $content .= $newTypes;

        file_put_contents($indexFile, $content);

        $this->info("✅ Tipos TypeScript agregados a index.d.ts");
    }

    protected function mapPhpTypeToTypeScript(string $phpType): string
    {
        return match ($phpType) {
            'string', 'text', 'date', 'datetime', 'timestamp' => 'string',
            'integer', 'bigInteger', 'decimal', 'float' => 'number',
            'boolean' => 'boolean',
            'json' => 'any',
            'foreignId' => 'number',
            default => 'any',
        };
    }

    protected function createController(string $model, string $controller, string $pluralLower, array $fields): void
    {
        $controllerPath = app_path("Http/Controllers/{$controller}.php");

        // Crear directorio si no existe
        $controllerDir = dirname($controllerPath);
        if (!is_dir($controllerDir)) {
            mkdir($controllerDir, 0755, true);
        }

        // Generar reglas de validación
        $validationRules = [];
        foreach ($fields as $field) {
            $rules = [];

            if (!$field['nullable']) {
                $rules[] = 'required';
            } else {
                $rules[] = 'nullable';
            }

            $rules[] = match ($field['type']) {
                'string' => 'string|max:255',
                'text' => 'string',
                'integer', 'bigInteger' => 'integer',
                'decimal', 'float' => 'numeric|min:0',
                'boolean' => 'boolean',
                'date' => 'date',
                'datetime', 'timestamp' => 'date',
                'json' => 'array',
                'foreignId' => 'exists:table,id',
                default => 'string',
            };

            $validationRules[] = "'{$field['name']}' => '" . implode('|', $rules) . "'";
        }

        $validationString = implode(",\n                ", $validationRules);

        $controllerContent = <<<PHP
<?php

namespace App\Http\Controllers;

use App\Models\\{$model};
use Illuminate\Http\Request;
use Inertia\Inertia;

class {$controller} extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('{$pluralLower}/Index', [
            'data' => {$model}::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('{$pluralLower}/Upsert', [
            'data' => null
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request \$request)
    {
        try {
            \$validated = \$request->validate([
                {$validationString}
            ]);
            {$model}::create(\$validated);
        } catch (\Exception \$e) {
            return redirect()->back()->withErrors(['error' => 'Error al crear: ' . \$e->getMessage()]);
        }

        return redirect()->route('{$pluralLower}')->with('success', 'Registro creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string \$id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string \$id)
    {
        \$data = {$model}::findOrFail(\$id);
        return Inertia::render('{$pluralLower}/Upsert', [
            'data' => \$data,
            'mode' => 'edit'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request \$request, string \$id)
    {
        try {
            \$validated = \$request->validate([
                {$validationString}
            ]);
            \$data = {$model}::findOrFail(\$id);
            \$data->update(\$validated);
        } catch (\Exception \$e) {
            return redirect()->back()->withErrors(['error' => 'Error al actualizar: ' . \$e->getMessage()]);
        }
        
        return redirect()->route('{$pluralLower}')->with('success', 'Registro actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string \$id)
    {
        try {
            \$data = {$model}::findOrFail(\$id);
            \$data->delete();
        } catch (\Exception \$e) {
            return redirect()->back()->withErrors(['error' => 'Error al eliminar: ' . \$e->getMessage()]);
        }

        return redirect()->route('{$pluralLower}')->with('success', 'Registro eliminado exitosamente.');
    }
}
PHP;

        file_put_contents($controllerPath, $controllerContent);

        $this->info("✅ Controlador {$controller} creado con validaciones personalizadas");
    }

    protected function generateZodSchema(array $fields): string
    {
        $schemaFields = [];

        foreach ($fields as $field) {
            $zodType = match ($field['type']) {
                'string' => 'z.string().min(2).max(255)',
                'text' => 'z.string()',
                'integer', 'bigInteger' => 'z.number().int()',
                'decimal', 'float' => 'z.number().min(0)',
                'boolean' => 'z.boolean()',
                'date', 'datetime', 'timestamp' => 'z.string()',
                'json' => 'z.any()',
                'foreignId' => 'z.number()',
                default => 'z.string()',
            };

            if ($field['nullable']) {
                $zodType .= '.optional()';
            }

            $schemaFields[] = "  {$field['name']}: {$zodType}";
        }

        return implode(",\n", $schemaFields);
    }

    protected function generateFormFieldsConfig(array $fields): string
    {
        $configs = [];

        foreach ($fields as $field) {
            $label = ucfirst(str_replace('_', ' ', $field['name']));

            $inputType = match ($field['type']) {
                'string' => 'text',
                'text' => 'text',
                'integer', 'bigInteger', 'decimal', 'float' => 'number',
                'boolean' => 'text', // Se podría usar checkbox
                'date' => 'date',
                'datetime', 'timestamp' => 'datetime-local',
                'json' => 'text',
                'foreignId' => 'number',
                default => 'text',
            };

            $configs[] = <<<JS
  {
    name: '{$field['name']}',
    label: '{$label}',
    type: '{$inputType}',
    placeholder: {
      create: 'Enter {$label}',
      edit: 'Enter {$label}',
    },
    description: {
      create: 'This is the {$label} field.',
      edit: 'This is the {$label} field.',
    },
  }
JS;
        }

        return implode(",\n", $configs);
    }

    protected function generateDefaultValues(array $fields): string
    {
        $defaults = [];

        foreach ($fields as $field) {
            $defaultValue = match ($field['type']) {
                'integer', 'bigInteger', 'decimal', 'float', 'foreignId' => '0',
                'boolean' => 'false',
                default => "''",
            };

            $defaults[] = "      {$field['name']}: data?.{$field['name']} || {$defaultValue}";
        }

        return implode(",\n", $defaults);
    }
}

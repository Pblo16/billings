<?php

namespace App\Console\Commands\Services;

use Illuminate\Console\Command;

class ControllerGenerator
{
  public function __construct(
    private Command $command,
    private FieldManager $fieldManager
  ) {}

  public function createController(array $config, array $fields): void
  {
    $controllerPath = ($config['parentPath'] !== '')
      ? app_path("Http/Controllers/{$config['parentPath']}/{$config['controller']}.php")
      : app_path("Http/Controllers/{$config['controller']}.php");

    // Crear directorio si no existe
    $controllerDir = dirname($controllerPath);
    if (! is_dir($controllerDir)) {
      mkdir($controllerDir, 0755, true);
    }

    // Configurar campos para el método select
    $this->fieldManager->setFieldsForSelect($fields);

    // Generar reglas de validación usando FieldManager
    $validationRules = $this->fieldManager->generateValidationRules($fields);

    // Si el controlador ya existe, solo actualizar validaciones
    if (file_exists($controllerPath)) {
      $this->updateControllerValidations($controllerPath, $validationRules);
      return;
    }

    // Si no existe, crear nuevo controlador
    $validationString = implode(",\n                ", $validationRules);

    // Construir namespace con parent path
    $controllerNamespace = ($config['parentPath'] !== '')
      ? 'App\\Http\\Controllers\\' . str_replace('/', '\\', $config['parentPath'])
      : 'App\\Http\\Controllers';

    $modelNamespace = ($config['parentPath'] !== '')
      ? 'App\\Models\\' . str_replace('/', '\\', $config['parentPath']) . "\\{$config['model']}"
      : "App\\Models\\{$config['model']}";

    $controllerContent = $this->generateControllerTemplate(
      $controllerNamespace,
      $modelNamespace,
      $config,
      $validationString
    );

    file_put_contents($controllerPath, $controllerContent);

    $this->command->info("✅ Controlador {$config['controller']} creado con validaciones personalizadas");
  }

  /**
   * Update validation rules in existing controller
   */
  private function updateControllerValidations(string $controllerPath, array $newValidationRules): void
  {
    $content = file_get_contents($controllerPath);

    // Extraer las validaciones existentes de store() y update()
    foreach (['store', 'update'] as $method) {
      // Buscar el bloque de validación en cada método
      $pattern = "/(public function {$method}\([^)]*\)[^{]*\{[^}]*\\\$request->validate\(\[\s*)(.*?)(\s*\]\);)/s";

      if (preg_match($pattern, $content, $matches)) {
        $existingValidations = $matches[2];

        // Parsear validaciones existentes
        $existingRules = $this->parseExistingValidations($existingValidations);

        // Agregar solo las nuevas reglas
        foreach ($newValidationRules as $rule) {
          // Extraer el nombre del campo de la regla (antes de "=>")
          if (preg_match("/^'([^']+)'/", $rule, $fieldMatch)) {
            $fieldName = $fieldMatch[1];

            // Si el campo no existe en las validaciones actuales, agregarlo
            if (!isset($existingRules[$fieldName])) {
              $existingRules[$fieldName] = $rule;
            }
          }
        }

        // Reconstruir el string de validaciones
        $updatedValidationString = implode(",\n      ", array_values($existingRules));

        // Reemplazar en el contenido usando callback para evitar problemas con $1, $2, etc
        $content = preg_replace_callback($pattern, function ($matches) use ($updatedValidationString) {
          return $matches[1] . $updatedValidationString . $matches[3];
        }, $content, 1);
      }
    }

    file_put_contents($controllerPath, $content);
    $this->command->info("✅ Controlador actualizado: nuevas validaciones agregadas");
  }
  /**
   * Parse existing validation rules from controller
   */
  private function parseExistingValidations(string $validationsString): array
  {
    $rules = [];

    // Dividir por líneas y procesar cada regla
    $lines = array_filter(array_map('trim', explode("\n", $validationsString)));

    foreach ($lines as $line) {
      // Extraer nombre del campo
      if (preg_match("/^'([^']+)'\s*=>/", $line, $match)) {
        $fieldName = $match[1];
        $rules[$fieldName] = rtrim($line, ',');
      }
    }

    return $rules;
  }

  private function generateControllerTemplate(
    string $controllerNamespace,
    string $modelNamespace,
    array $config,
    string $validationString
  ): string {
    $viewBase = ($config['parentPathLower'] ? $config['parentPathLower'] . '/' : '') . $config['pluralLower'];

    // Generar la lista de campos para el select del paginated
    $selectFields = $this->fieldManager->getFieldNamesForSelectFromFields();

    return <<<PHP
<?php

namespace {$controllerNamespace};

use App\Http\Controllers\Controller;
use {$modelNamespace};
use Illuminate\Http\Request;
use Inertia\Inertia;

class {$config['controller']} extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    return Inertia::render('{$viewBase}/Index', [
      'data' => {$config['model']}::all()
    ]);
  }

  /**
   * Show the form for creating a new resource.
   */
  public function create()
  {
    return Inertia::render('{$viewBase}/Upsert', [
      'data' => null
    ]);
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request \$request)
  {
    \$validated = \$request->validate([
      {$validationString}
    ]);
    {$config['model']}::create(\$validated);

    return redirect()->route('{$config['fullRouteName']}')->with('success', 'Registro creado exitosamente.');
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
    \$data = {$config['model']}::findOrFail(\$id);
    return Inertia::render('{$viewBase}/Upsert', [
      'data' => \$data,
      'mode' => 'edit'
    ]);
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request \$request, string \$id)
  {
    \$validated = \$request->validate([
      {$validationString}
    ]);
    \$data = {$config['model']}::findOrFail(\$id);
    \$data->update(\$validated);
        
    return redirect()->route('{$config['fullRouteName']}')->with('success', 'Registro actualizado exitosamente.');
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(string \$id)
  {
    try {
      \$data = {$config['model']}::findOrFail(\$id);
      \$data->delete();
    } catch (\Exception \$e) {
      return redirect()->back()->withErrors(['error' => 'Error al eliminar: ' . \$e->getMessage()]);
    }

    return redirect()->route('{$config['fullRouteName']}')->with('success', 'Registro eliminado exitosamente.');
  }

  /**
   * Get paginated data for API.
   */
  public function paginated(Request \$request)
  {
    \$perPage = \$request->get('perPage', 10);
    \$query = {$config['model']}::query()->select({$selectFields})->paginate(\$perPage);

    return response()->json(\$query);
  }
}
PHP;
  }
}

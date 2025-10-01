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
    if (!is_dir($controllerDir)) {
      mkdir($controllerDir, 0755, true);
    }

    // Generar reglas de validación usando FieldManager
    $validationRules = $this->fieldManager->generateValidationRules($fields);
    $validationString = implode(",\n                ", $validationRules);

    // Construir namespace con parent path
    $controllerNamespace = ($config['parentPath'] !== '')
      ? "App\\Http\\Controllers\\" . str_replace('/', '\\', $config['parentPath'])
      : "App\\Http\\Controllers";

    $modelNamespace = ($config['parentPath'] !== '')
      ? "App\\Models\\" . str_replace('/', '\\', $config['parentPath']) . "\\{$config['model']}"
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

  private function generateControllerTemplate(
    string $controllerNamespace,
    string $modelNamespace,
    array $config,
    string $validationString
  ): string {
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
        return Inertia::render('{$config['parentPathLower']}/{$config['pluralLower']}/Index', [
            'data' => {$config['model']}::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('{$config['parentPathLower']}/{$config['pluralLower']}/Upsert', [
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
            {$config['model']}::create(\$validated);
        } catch (\Exception \$e) {
            return redirect()->route('{$config['fullRouteName']}')->withErrors(['error' => 'Error al crear: ' . \$e->getMessage()]);
        }

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
        return Inertia::render('{$config['parentPathLower']}/{$config['pluralLower']}/Upsert', [
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
            \$data = {$config['model']}::findOrFail(\$id);
            \$data->update(\$validated);
        } catch (\Exception \$e) {
            return redirect()->route('{$config['fullRouteName']}')->withErrors(['error' => 'Error al actualizar: ' . \$e->getMessage()]);
        }
        
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
}
PHP;
  }
}

<?php

namespace App\Console\Commands\Services;

use Illuminate\Console\Command;

class ReactFileGenerator
{
  private const REACT_FILES = [
    'columns.tsx' => 'columns.tsx',
    'Index.tsx' => 'Index.tsx',
    'Upsert.tsx' => 'Upsert.tsx',
    'Form.tsx' => 'Form.tsx',
  ];

  public function __construct(
    private Command $command,
    private FieldManager $fieldManager
  ) {}

  public function generateReactFiles(array $config, array $fields): void
  {
    // Crear directorio de vistas Inertia si no existe
    if (!is_dir($config['viewPath'])) {
      mkdir($config['viewPath'], 0755, true);
    }

    // Archivos a generar con sus respectivos stubs
    $files = [
      'columns.tsx' => "{$config['viewPath']}/columns.tsx",
      'Index.tsx' => "{$config['viewPath']}/Index.tsx",
      'Upsert.tsx' => "{$config['viewPath']}/Upsert.tsx",
      'Form.tsx' => "{$config['viewPath']}/{$config['name']}Form.tsx",
    ];

    // Reemplazos comunes
    $replacements = [
      'name' => $config['name'],
      'plural' => $config['plural'],
      'pluralLower' => $config['pluralLower'],
      'model' => $config['model'],
      'modelLower' => $config['modelLower'],
      'nameLower' => $config['nameLower'],
      'parentPath' => $config['parentPath'],
      'parentPathLower' => $config['parentPathLower'],
      'routePath' => ($config['parentPathLower'] !== '') ? "{$config['parentPathLower']}/" : '',
    ];

    // Generar código de campos para React usando FieldManager
    if (!empty($fields)) {
      $replacements['zodSchema'] = $this->fieldManager->generateZodSchema($fields);
      $replacements['formFieldsConfig'] = $this->fieldManager->generateFormFieldsConfig($fields);
      $replacements['defaultValues'] = $this->fieldManager->generateDefaultValues($fields);
    }

    foreach ($files as $stub => $path) {
      $this->makeReactFile($path, $stub, $replacements);
    }

    $this->command->info("✅ Vistas Inertia creadas en {$config['viewPath']}");
  }

  private function makeReactFile(string $path, string $stub, array $replacements): void
  {
    $stubPath = base_path("stubs/inertia/{$stub}.stub");

    if (!file_exists($stubPath)) {
      $this->command->error("❌ No se encontró el stub: {$stubPath}");
      return;
    }

    $content = file_get_contents($stubPath);

    foreach ($replacements as $search => $replace) {
      $content = str_replace("{{{$search}}}", $replace, $content);
    }

    file_put_contents($path, $content);

    $this->command->line("📄 Creado: {$path}");
  }
}

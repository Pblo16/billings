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
        $model       = Str::studly($this->argument('name'));
        $controller  = "{$model}Controller";
        $plural      = Str::pluralStudly($model);
        $pluralLower = Str::lower($plural);
        $modelLower  = Str::camel($model);

        $viewPath = resource_path("js/pages/{$plural}");

        // Crear modelo + migración
        $this->call('make:model', ['name' => $model, '-m' => true]);

        // Crear controlador de tipo resource
        $this->call('make:controller', ['name' => $controller, '--resource' => true]);

        // Crear directorio de vistas Inertia si no existe
        if (! is_dir($viewPath)) {
            mkdir($viewPath, 0755, true);
        }

        // Archivos a generar con sus respectivos stubs
        $files = [
            'columns.tsx'      => "{$viewPath}/columns.tsx",
            'Index.tsx'        => "{$viewPath}/Index.tsx",
            'Upsert.tsx'       => "{$viewPath}/Upsert.tsx",
            'Form.tsx'         => "{$viewPath}/{$model}Form.tsx",
        ];

        // Reemplazos comunes
        $replacements = [
            'name'        => $model,
            'plural'      => $plural,
            'pluralLower' => $pluralLower,
            'model'       => $model,
            'modelLower'  => $modelLower,
        ];

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
}

<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class MakeInertiaCrud extends Command
{
    protected $signature = 'make:inertia {name}';
    protected $description = 'Crea modelo, controlador y vistas para Inertia';

    public function handle()
    {
        $name = $this->argument('name');
        $model = Str::studly($name);
        $controller = "{$model}Controller";
        $plural = Str::pluralStudly($model);
        $indexFile = resource_path("js/pages/{$plural}/Index.tsx");

        // Crear modelo + migración
        $this->call('make:model', [
            'name' => $model,
            '-m' => true,
        ]);

        // Crear controlador de tipo resource
        $this->call('make:controller', [
            'name' => $controller,
            '--resource' => true,
        ]);

        // Crear directorio de vistas Inertia
        $viewPath = resource_path("js/pages/{$plural}");
        if (! is_dir($viewPath)) {
            mkdir($viewPath, 0755, true);
        }

        // Usar stub de TypeScript
        $this->makeReactFile($indexFile, 'Index.tsx', [
            'name' => $model,
            'plural' => $plural,
            'pluralLower' => Str::lower($plural),
            'model' => $model,
        ]);

        $this->info("Modelo {$model}, controlador {$controller} y vistas Inertia creadas en {$viewPath}");
    }

    protected function makeReactFile($path, $stub, $replacements)
    {
        $stubPath = base_path("stubs/inertia/{$stub}.stub");
        if (!file_exists($stubPath)) {
            $this->error("No se encontró el stub: {$stubPath}");
            return;
        }
        $content = file_get_contents($stubPath);

        foreach ($replacements as $search => $replace) {
            $content = str_replace("{{{$search}}}", $replace, $content);
        }

        file_put_contents($path, $content);
    }
}

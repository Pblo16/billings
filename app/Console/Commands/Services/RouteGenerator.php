<?php

namespace App\Console\Commands\Services;

use Illuminate\Console\Command;

class RouteGenerator
{
    public function __construct(
        private Command $command
    ) {}

    public function addRouteToWeb(array $config): void
    {
        $webPath = base_path('routes/web.php');

        if (! file_exists($webPath)) {
            $this->command->error('routes/web.php not found');

            return;
        }

        $content = file_get_contents($webPath);

        // Generar el use statement para el controlador
        $useStatement = "use {$config['controllerNamespace']}\\{$config['controller']};";

        // Verificar si el use ya existe
        if (! str_contains($content, $useStatement)) {
            // Encontrar el último use statement y agregar después de él
            $pattern = '/(use [^;]+;)/';
            preg_match_all($pattern, $content, $matches);

            if (! empty($matches[0])) {
                $lastUse = end($matches[0]);
                $content = str_replace(
                    $lastUse,
                    $lastUse."\n".$useStatement,
                    $content
                );
            }
        }

        // Generar la ruta
        $route = $this->generateRoute($config);

        // Encontrar el lugar correcto para insertar la ruta (antes de los require)
        $pattern = '/(\n)(require __DIR__)/';

        if (preg_match($pattern, $content)) {
            $content = preg_replace(
                $pattern,
                "\n    ".$route."\n\$1\$2",
                $content,
                1
            );
        } else {
            // Si no encuentra los require, agregar al final del middleware group
            $pattern = '/(Route::middleware\(\[.*?\]\)->group\(function \(\) \{.*?)(}\);)/s';
            $content = preg_replace(
                $pattern,
                '$1    '.$route."\n\$2",
                $content,
                1
            );
        }

        file_put_contents($webPath, $content);
        $this->command->info('Route added to routes/web.php');
    }

    private function generateRoute(array $config): string
    {
        // Construir el path de la ruta
        $routePath = $config['routePath'];

        // Construir el nombre base de la ruta
        $routeName = $config['routeName'];

        // Generar la ruta completa
        $route = "Route::resource('{$routePath}', {$config['controller']}::class)->names([\n";
        $route .= "        'index' => '{$routeName}',\n";
        $route .= "        'create' => '{$routeName}.create',\n";
        $route .= "        'store' => '{$routeName}.store',\n";
        $route .= "        'show' => '{$routeName}.show',\n";
        $route .= "        'edit' => '{$routeName}.edit',\n";
        $route .= "        'update' => '{$routeName}.update',\n";
        $route .= "        'destroy' => '{$routeName}.destroy'\n";
        $route .= '    ]);';

        return $route;
    }
}

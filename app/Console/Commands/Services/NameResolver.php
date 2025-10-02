<?php

namespace App\Console\Commands\Services;

use Illuminate\Support\Str;

class NameResolver
{
    public function __construct(
        private string $raw
    ) {}

    public function resolve(): array
    {
        // Normalizar separadores y dividir en segmentos
        $normalizedRaw = str_replace('\\', '/', $this->raw);
        $segments = array_values(array_filter(explode('/', $normalizedRaw)));

        // Extraer último segmento (modelo) y construir la ruta padre sin el último segmento
        $modelSegment = array_pop($segments);
        $parentPath = implode('/', $segments); // "Admin/Security" o "" si no hay padre
        $parentPathLower = Str::lower($parentPath);

        // Modelo/Nombre/Controller habituales (usar $modelSegment como nombre base)
        $model = Str::studly($modelSegment);
        $controller = "{$model}Controller";
        $plural = Str::pluralStudly($model);
        $pluralLower = Str::lower($plural);
        $modelLower = Str::lower($model);
        $name = class_basename($model);
        $nameLower = Str::lower($name);

        // Generar ruta completa para las rutas (ej: admin.security.role)
        $fullRouteName = ($parentPathLower !== '')
          ? str_replace('/', '.', $parentPathLower).'.'.$modelLower
          : $modelLower;

        // Generar route path (ej: admin/security/role)
        $routePath = ($parentPathLower !== '')
          ? $parentPathLower.'/'.$modelLower
          : $modelLower;

        // Generar route name (ej: admin.security.role)
        $routeName = str_replace('/', '.', $routePath);

        // Generar namespace del controlador
        $controllerNamespace = ($parentPath !== '')
          ? 'App\\Http\\Controllers\\'.str_replace('/', '\\', $parentPath)
          : 'App\\Http\\Controllers';

        // Ejemplo: si quieres usar la ruta padre para vistas => resources/js/pages/Admin/Security/roles
        $viewFolder = ($parentPath !== '') ? "{$parentPathLower}/{$pluralLower}" : $pluralLower;
        $viewPath = resource_path("js/pages/{$viewFolder}");

        // Ruta del modelo con path
        $modelWithPath = ($parentPath !== '') ? "{$parentPath}/{$model}" : $model;

        return [
            'segments' => $segments,
            'modelSegment' => $modelSegment,
            'parentPath' => $parentPath,
            'parentPathLower' => $parentPathLower,
            'model' => $model,
            'controller' => $controller,
            'plural' => $plural,
            'pluralLower' => $pluralLower,
            'modelLower' => $modelLower,
            'name' => $name,
            'nameLower' => $nameLower,
            'fullRouteName' => $fullRouteName,
            'routePath' => $routePath,
            'routeName' => $routeName,
            'controllerNamespace' => $controllerNamespace,
            'viewFolder' => $viewFolder,
            'viewPath' => $viewPath,
            'modelWithPath' => $modelWithPath,
        ];
    }
}

<?php

namespace App\Console\Commands\Services;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class MigrationUpdater
{
    public function __construct(
        private Command $command
    ) {}

    /**
     * Find an existing migration file for a model
     */
    public function findMigration(string $model): ?string
    {
        $migrationPath = database_path('migrations');
        $modelBaseName = class_basename($model);
        $files = glob("{$migrationPath}/*_create_".Str::snake(Str::plural($modelBaseName)).'_table.php');

        return empty($files) ? null : end($files);
    }

    /**
     * Generate field code for migration
     */
    private function generateFieldCode(array $field, int $indent = 12): string
    {
        $line = "\$table->{$field['type']}('{$field['name']}')";

        // Agregar nullable ANTES de los constraints (importante para foreignId con set null)
        if ($field['nullable']) {
            $line .= '->nullable()';
        }

        // Para foreignId, agregar constraints DESPUÉS de nullable
        if ($field['type'] === 'foreignId' && isset($field['references'])) {
            $line .= "->constrained('{$field['references']}')";

            if (isset($field['on_delete'])) {
                $onDelete = $field['on_delete'];
                $line .= "->onDelete('{$onDelete}')";
            }
        }

        $line .= ';';

        return str_repeat(' ', $indent).$line."\n";
    }

    public function updateMigration(string $model, array $fields): void
    {
        // Buscar el archivo de migración más reciente
        $migrationFile = $this->findMigration($model);

        if (! $migrationFile) {
            $this->command->error('❌ No se encontró el archivo de migración');

            return;
        }
        $content = file_get_contents($migrationFile);

        // Generar código de campos
        $fieldsCode = '';
        foreach ($fields as $field) {
            $fieldsCode .= $this->generateFieldCode($field);
        }

        // Buscar el lugar donde insertar los campos (después de $table->id())
        $pattern = '/(\$table->id\(\);)/';
        $replacement = "$1\n{$fieldsCode}";

        $content = preg_replace($pattern, $replacement, $content);

        file_put_contents($migrationFile, $content);

        $this->command->info('✅ Migración actualizada con los campos definidos');
    }

    /**
     * Update a migration file that adds columns to an existing table
     */
    public function updateAddColumnsMigration(string $model, array $fields): void
    {
        // Buscar la migración más reciente de tipo "add_*_to_*_table"
        $migrationPath = database_path('migrations');
        $modelBaseName = class_basename($model);
        $tableName = Str::snake(Str::plural($modelBaseName));

        // Buscar todas las migraciones que agregan columnas a esta tabla
        $files = glob("{$migrationPath}/*_add_*_to_{$tableName}_table.php");

        if (empty($files)) {
            $this->command->error('❌ No se encontró la migración de agregar columnas');

            return;
        }

        // Obtener la más reciente
        $migrationFile = end($files);
        $content = file_get_contents($migrationFile);

        // Generar código de campos
        $fieldsCode = '';
        foreach ($fields as $field) {
            $fieldsCode .= $this->generateFieldCode($field);
        }

        // Buscar el Schema::table y agregar los campos
        $pattern = '/(Schema::table\([^,]+,\s*function\s*\([^)]+\)\s*\{)/';
        $replacement = "$1\n{$fieldsCode}";

        $content = preg_replace($pattern, $replacement, $content);

        // También necesitamos agregar los dropColumn en el método down()
        $dropFieldsCode = '';
        $fieldNames = array_map(fn ($field) => "'{$field['name']}'", $fields);
        $dropFieldsCode = str_repeat(' ', 12).'$table->dropColumn(['.implode(', ', $fieldNames).']);'."\n";

        // Buscar el segundo Schema::table (el del método down) y agregar dropColumn
        $pattern = '/(public function down\(\): void\s*\{[^}]*Schema::table\([^,]+,\s*function\s*\([^)]+\)\s*\{)/s';
        $replacement = "$1\n{$dropFieldsCode}";

        $content = preg_replace($pattern, $replacement, $content);

        file_put_contents($migrationFile, $content);

        $this->command->info('✅ Migración de agregar columnas actualizada');
    }

    public function updateModelFillable(string $model, string $parentPath, array $fields, bool $isUpdating = false): void
    {
        $modelPath = ($parentPath !== '')
            ? app_path("Models/{$parentPath}/{$model}.php")
            : app_path("Models/{$model}.php");

        if (! file_exists($modelPath)) {
            $this->command->error("❌ No se encontró el modelo en {$modelPath}");

            return;
        }

        $content = file_get_contents($modelPath);

        // Generar array de campos fillable
        $fillableFields = array_map(fn ($field) => "'{$field['name']}'", $fields);

        if ($isUpdating && preg_match('/protected\s+\$fillable\s*=\s*\[(.*?)\];/s', $content, $matches)) {
            // Actualizar fillable existente
            $existingFillable = $matches[1];
            $existingFields = array_filter(array_map('trim', explode(',', $existingFillable)));

            // Agregar solo los campos nuevos
            $newFields = array_merge($existingFields, $fillableFields);
            $newFields = array_unique(array_filter($newFields));

            $fillableString = "[\n        ".implode(",\n        ", $newFields).",\n    ]";
            $content = preg_replace(
                '/protected\s+\$fillable\s*=\s*\[.*?\];/s',
                "protected \$fillable = {$fillableString};",
                $content
            );

            $this->command->info('✅ Modelo actualizado: nuevos campos agregados a $fillable');
        } else {
            // Crear fillable nuevo
            $fillableString = "[\n        ".implode(",\n        ", $fillableFields).",\n    ]";

            // Buscar el lugar donde insertar fillable (después de "class NombreModelo extends Model")
            $modelBaseName = class_basename($model);
            $pattern = '/(class\s+'.preg_quote($modelBaseName, '/').'\s+extends\s+Model\s*\{)/';
            $fillableCode = "\n    protected \$fillable = {$fillableString};\n";

            $content = preg_replace_callback($pattern, function ($matches) use ($fillableCode) {
                return $matches[0].$fillableCode;
            }, $content);

            $this->command->info('✅ Modelo actualizado con $fillable');
        }

        file_put_contents($modelPath, $content);
    }

    public function addTypesToIndexFile(string $name, array $fields, bool $isUpdating = false): void
    {
        $indexFile = resource_path('js/types/index.d.ts');

        if (! file_exists($indexFile)) {
            $this->command->error('❌ No se encontró el archivo index.d.ts');

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

        if ($isUpdating && preg_match("/export interface {$name} \{(.*?)\n\}/s", $content, $matches)) {
            // Actualizar interface existente
            $existingContent = $matches[1];

            // Insertar nuevos campos antes de created_at (si existe)
            if (preg_match('/(.*?)(    created_at\?:.*)/s', $existingContent, $parts)) {
                $beforeTimestamps = $parts[1];
                $timestamps = $parts[2];
                $updatedContent = $beforeTimestamps.$typeDefinitions.$timestamps;
            } else {
                // Si no hay timestamps, agregar al final
                $updatedContent = $existingContent.$typeDefinitions;
            }

            $content = preg_replace(
                "/export interface {$name} \{.*?\n\}/s",
                "export interface {$name} {{$updatedContent}\n}",
                $content
            );

            // Actualizar también el Form interface
            if (preg_match("/export interface {$name}Form \{(.*?)\n\}/s", $content, $formMatches)) {
                $existingFormContent = $formMatches[1];
                $updatedFormContent = $existingFormContent.$typeDefinitions;

                $content = preg_replace(
                    "/export interface {$name}Form \{.*?\n\}/s",
                    "export interface {$name}Form {{$updatedFormContent}\n}",
                    $content
                );
            }

            $this->command->info('✅ Tipos TypeScript actualizados en index.d.ts');
        } else {
            // Crear tipos nuevos
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

            $this->command->info('✅ Tipos TypeScript agregados a index.d.ts');
        }

        file_put_contents($indexFile, $content);
    }

    private function mapPhpTypeToTypeScript(string $phpType): string
    {
        return match ($phpType) {
            'string', 'text', 'date', 'datetime', 'timestamp' => 'string',
            'integer', 'bigInteger', 'decimal', 'float', 'foreignId' => 'number',
            'boolean' => 'boolean',
            'json' => 'any',
            default => 'string',
        };
    }
}

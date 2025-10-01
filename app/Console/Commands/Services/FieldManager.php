<?php

namespace App\Console\Commands\Services;

use Illuminate\Console\Command;

class FieldManager
{
  private const FIELD_TYPES = [
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

  public function __construct(
    private Command $command
  ) {}

  public function askForFields(): array
  {
    $fields = [];
    $this->command->info('📝 Ahora vamos a definir los campos del modelo (presiona Enter sin escribir nada para terminar)');

    while (true) {
      $fieldName = $this->command->ask('Nombre del campo (o Enter para terminar)');

      if (empty($fieldName)) {
        break;
      }

      $fieldType = $this->command->choice(
        "Tipo de dato para '{$fieldName}'",
        self::FIELD_TYPES,
        0
      );

      $nullable = $this->command->confirm("¿El campo '{$fieldName}' puede ser nulo?", false);

      $fields[] = [
        'name' => $fieldName,
        'type' => $fieldType,
        'nullable' => $nullable,
      ];

      $this->command->info("✅ Campo '{$fieldName}' ({$fieldType}) agregado");
    }

    return $fields;
  }

  public function generateZodSchema(array $fields): string
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

  public function generateFormFieldsConfig(array $fields): string
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

  public function generateDefaultValues(array $fields): string
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

  public function generateValidationRules(array $fields): array
  {
    $validationRules = [];

    foreach ($fields as $field) {
      $rules = [];

      if (!$field['nullable']) {
        $rules[] = 'required';
      } else {
        $rules[] = 'nullable';
      }

      switch ($field['type']) {
        case 'string':
          $rules[] = 'string';
          $rules[] = 'max:255';
          break;
        case 'text':
          $rules[] = 'string';
          break;
        case 'integer':
        case 'bigInteger':
        case 'foreignId':
          $rules[] = 'integer';
          break;
        case 'decimal':
        case 'float':
          $rules[] = 'numeric';
          break;
        case 'boolean':
          $rules[] = 'boolean';
          break;
        case 'date':
          $rules[] = 'date';
          break;
        case 'datetime':
        case 'timestamp':
          $rules[] = 'date';
          break;
        case 'json':
          $rules[] = 'json';
          break;
      }

      $validationRules[] = "'{$field['name']}' => '" . implode('|', $rules) . "'";
    }

    return $validationRules;
  }
}

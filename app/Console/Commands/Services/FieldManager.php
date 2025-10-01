<?php

namespace App\Console\Commands\Services;

use Illuminate\Console\Command;

use function Laravel\Prompts\text;
use function Laravel\Prompts\select;
use function Laravel\Prompts\confirm;
use function Laravel\Prompts\note;
use function Laravel\Prompts\info;
use function Laravel\Prompts\warning;
use function Laravel\Prompts\error;

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

  private const FIELD_TYPE_DESCRIPTIONS = [
    'string' => 'string - Short text (max 255 chars)',
    'text' => 'text - Long text',
    'integer' => 'integer - Whole number',
    'bigInteger' => 'bigInteger - Large whole number',
    'boolean' => 'boolean - True/False',
    'date' => 'date - Date (YYYY-MM-DD)',
    'datetime' => 'datetime - Date and time',
    'timestamp' => 'timestamp - Timestamp',
    'decimal' => 'decimal - Decimal number',
    'float' => 'float - Floating point number',
    'json' => 'json - JSON data',
    'foreignId' => 'foreignId - Foreign key reference',
  ];

  public function __construct(
    private Command $command
  ) {}

  public function askForFields(): array
  {
    $fields = [];

    info('Now we will define the model fields');
    note('• Use arrow keys ↑↓ to navigate options' . PHP_EOL . '• Press ESC to skip optional fields');
    $this->command->newLine();

    while (true) {
      $fieldName = text(
        label: 'Field name',
        placeholder: 'E.g. title, description, price',
        hint: 'Press Ctrl+C to finish adding fields',
        validate: fn($value) => $this->validateFieldName($value, $fields)
      );

      if (empty($fieldName)) {
        if (empty($fields)) {
          warning('You must add at least one field');
          continue;
        }
        break;
      }

      $fieldType = select(
        label: "Select data type for '{$fieldName}'",
        options: $this->getFieldTypesWithDescriptions(),
        default: 'string',
        scroll: 10
      );

      // Extraer solo el tipo sin la descripción
      $fieldType = explode(' - ', $fieldType)[0];

      $nullable = confirm(
        label: "Can '{$fieldName}' be nullable?",
        default: false
      );

      // Preguntas adicionales según el tipo
      $additional = $this->askAdditionalFieldOptions($fieldName, $fieldType);

      $fields[] = array_merge([
        'name' => $fieldName,
        'type' => $fieldType,
        'nullable' => $nullable,
      ], $additional);

      $nullableText = $nullable ? '(nullable)' : '(required)';
      info("Field '{$fieldName}' ({$fieldType}) {$nullableText} added");
      $this->command->newLine();
    }

    $this->showFieldsSummary($fields);

    if (!$this->confirmFieldsConfiguration($fields)) {
      info('Restarting field configuration...');
      return $this->askForFields();
    }

    return $fields;
  }

  private function validateFieldName(string $value, array $existingFields): ?string
  {
    if (empty($value)) {
      return null; // Allow empty to finish
    }

    if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $value)) {
      return 'Field name must start with a letter or underscore and only contain letters, numbers, and underscores';
    }

    if (collect($existingFields)->contains('name', $value)) {
      return "Field '{$value}' already exists";
    }

    return null;
  }

  private function getFieldTypesWithDescriptions(): array
  {
    return array_values(self::FIELD_TYPE_DESCRIPTIONS);
  }

  private function askAdditionalFieldOptions(string $fieldName, string $fieldType): array
  {
    $additional = [];

    // Opciones específicas por tipo de campo
    switch ($fieldType) {
      case 'string':
        if (confirm(label: "Does '{$fieldName}' have a default value?", default: false)) {
          $additional['default'] = text(
            label: "Default value for '{$fieldName}'",
            placeholder: 'E.g. pending, active',
            default: ''
          );
        }

        if (confirm(label: "Change max length? (default: 255)", default: false)) {
          $additional['max_length'] = text(
            label: "Max length for '{$fieldName}'",
            placeholder: 'E.g. 255',
            default: '255',
            validate: fn($value) => !is_numeric($value) ? 'Must be a number' : null
          );
        }
        break;

      case 'decimal':
      case 'float':
        $precision = text(
          label: "Total precision for '{$fieldName}' (total digits)",
          placeholder: 'E.g. 8',
          default: '8',
          validate: fn($value) => !is_numeric($value) ? 'Must be a number' : null
        );
        $scale = text(
          label: "Scale for '{$fieldName}' (decimal digits)",
          placeholder: 'E.g. 2',
          default: '2',
          validate: fn($value) => !is_numeric($value) ? 'Must be a number' : null
        );
        $additional['precision'] = $precision;
        $additional['scale'] = $scale;
        break;

      case 'foreignId':
        $table = text(
          label: "Which table does '{$fieldName}' reference?",
          placeholder: 'E.g. users, products',
          default: 'users'
        );
        $additional['references'] = $table;

        $onDelete = select(
          label: "What to do when parent record is deleted?",
          options: [
            'cascade' => 'cascade - Delete this record too',
            'restrict' => 'restrict - Prevent deletion',
            'set null' => 'set null - Set field to null',
          ],
          default: 'cascade'
        );
        $additional['on_delete'] = $onDelete;
        break;

      case 'integer':
      case 'bigInteger':
        if (confirm(label: "Is '{$fieldName}' unsigned (positive only)?", default: false)) {
          $additional['unsigned'] = true;
        }
        break;
    }

    // Preguntar si es único (para todos los tipos excepto boolean y json)
    if (!in_array($fieldType, ['boolean', 'json'])) {
      if (confirm(label: "Should '{$fieldName}' be unique?", default: false)) {
        $additional['unique'] = true;
      }
    }

    return $additional;
  }

  private function showFieldsSummary(array $fields): void
  {
    if (empty($fields)) {
      return;
    }

    $this->command->newLine();
    $this->command->info('Fields Summary');

    $this->command->table(
      ['Field', 'Type', 'Nullable', 'Extras'],
      array_map(function ($field) {
        $extras = [];

        if (isset($field['unique']) && $field['unique']) {
          $extras[] = 'unique';
        }

        if (isset($field['default'])) {
          $extras[] = "default: {$field['default']}";
        }

        if (isset($field['max_length']) && $field['max_length'] != '255') {
          $extras[] = "max: {$field['max_length']}";
        }

        if (isset($field['precision']) && isset($field['scale'])) {
          $extras[] = "precision: {$field['precision']},{$field['scale']}";
        }

        if (isset($field['references'])) {
          $extras[] = "references: {$field['references']}";
        }

        if (isset($field['unsigned']) && $field['unsigned']) {
          $extras[] = 'unsigned';
        }

        return [
          $field['name'],
          $field['type'],
          $field['nullable'] ? '<fg=green>✓</>' : '<fg=red>✗</>',
          implode(', ', $extras) ?: '-'
        ];
      }, $fields)
    );

    $this->command->newLine();
  }

  private function confirmFieldsConfiguration(array $fields): bool
  {
    return confirm(
      label: 'Is the field configuration correct?',
      default: true
    );
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
          $maxLength = $field['max_length'] ?? '255';
          $rules[] = "max:{$maxLength}";
          break;
        case 'text':
          $rules[] = 'string';
          break;
        case 'integer':
        case 'bigInteger':
        case 'foreignId':
          $rules[] = 'integer';
          if (isset($field['unsigned']) && $field['unsigned']) {
            $rules[] = 'min:0';
          }
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

      // Agregar regla unique si está marcado
      if (isset($field['unique']) && $field['unique']) {
        $rules[] = 'unique:' . strtolower(class_basename($this->command->getModelName ?? 'model')) . 's';
      }

      $validationRules[] = "'{$field['name']}' => '" . implode('|', $rules) . "'";
    }

    return $validationRules;
  }

  public function generateMigrationFields(array $fields): array
  {
    $migrationFields = [];

    foreach ($fields as $field) {
      $fieldDefinition = "\$table->{$field['type']}('{$field['name']}'";

      // Agregar parámetros específicos por tipo
      switch ($field['type']) {
        case 'decimal':
        case 'float':
          if (isset($field['precision']) && isset($field['scale'])) {
            $fieldDefinition = "\$table->{$field['type']}('{$field['name']}', {$field['precision']}, {$field['scale']}";
          }
          break;
        case 'string':
          if (isset($field['max_length']) && $field['max_length'] != '255') {
            $fieldDefinition = "\$table->{$field['type']}('{$field['name']}', {$field['max_length']}";
          }
          break;
      }

      $fieldDefinition .= ')';

      // Agregar modificadores
      if (isset($field['unsigned']) && $field['unsigned']) {
        $fieldDefinition .= '->unsigned()';
      }

      if ($field['nullable']) {
        $fieldDefinition .= '->nullable()';
      }

      if (isset($field['unique']) && $field['unique']) {
        $fieldDefinition .= '->unique()';
      }

      if (isset($field['default'])) {
        $defaultValue = is_string($field['default']) ? "'{$field['default']}'" : $field['default'];
        $fieldDefinition .= "->default({$defaultValue})";
      }

      // Agregar foreign key constraint si es foreignId
      if ($field['type'] === 'foreignId' && isset($field['references'])) {
        $fieldDefinition .= "->constrained('{$field['references']}')";
        if (isset($field['on_delete'])) {
          $fieldDefinition .= "->onDelete('{$field['on_delete']}')";
        }
      }

      $fieldDefinition .= ';';
      $migrationFields[] = "            {$fieldDefinition}";
    }

    return $migrationFields;
  }
}

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/input-number'
import { PhoneInput } from '@/components/ui/input-phone'
import { FormFieldConfig } from '@/types'
import { usePage } from '@inertiajs/react'
import { useMemo } from 'react'
import {
  Control,
  ControllerRenderProps,
  FieldValues,
  Path,
} from 'react-hook-form'
import { AsyncCombobox } from './async-combobox'
import { Combobox } from './combobox'

interface FormFieldRendererProps<T extends FieldValues> {
  control: Control<T>
  fieldConfig: FormFieldConfig
  isEdit?: boolean
  errors?: Partial<Record<keyof T, any>>
}

/**
 * Helper to select the appropriate text based on edit mode
 */
const getContextualText = (
  config: { create: string; edit: string },
  isEdit: boolean,
): string => {
  return isEdit ? config.edit : config.create
}

/**
 * Renders a standard text/email/password input
 */
const renderStandardInput = <T extends FieldValues>(
  field: ControllerRenderProps<T, Path<T>>,
  fieldConfig: FormFieldConfig,
  isEdit: boolean,
) => (
  <Input
    type={fieldConfig.type}
    placeholder={getContextualText(fieldConfig.placeholder, isEdit)}
    {...field}
    onChange={(e) => field.onChange(e.target.value)}
    value={field.value ?? ''}
    readOnly={fieldConfig.readOnly || (isEdit && fieldConfig.onEditReadOnly)}
  />
)

/**
 * Renders a number input with formatting
 */
const renderNumberInput = <T extends FieldValues>(
  field: ControllerRenderProps<T, Path<T>>,
  fieldConfig: FormFieldConfig,
  isEdit: boolean,
) => (
  <NumberInput
    placeholder={getContextualText(fieldConfig.placeholder, isEdit)}
    value={field.value}
    onValueChange={(value) => field.onChange(value)}
    {...fieldConfig.numberInputProps}
    readOnly={fieldConfig.readOnly || (isEdit && fieldConfig.onEditReadOnly)}
  />
)

/**
 * Renders a phone input with formatting
 */
const renderPhoneInput = <T extends FieldValues>(
  field: ControllerRenderProps<T, Path<T>>,
  fieldConfig: FormFieldConfig,
  isEdit: boolean,
) => (
  <PhoneInput
    placeholder={getContextualText(fieldConfig.placeholder, isEdit)}
    value={field.value}
    onValueChange={(value) => field.onChange(value)}
    readOnly={fieldConfig.readOnly || (isEdit && fieldConfig.onEditReadOnly)}
  />
)

const renderSelectInput = <T extends FieldValues>(
  field: ControllerRenderProps<T, Path<T>>,
  fieldConfig: FormFieldConfig,
  isEdit: boolean,
) => {
  // Si tiene searchUrl, usar AsyncCombobox para búsqueda dinámica
  if (fieldConfig.searchUrl) {
    return (
      <AsyncCombobox
        searchUrl={fieldConfig.searchUrl}
        initialOptions={fieldConfig.options ?? []}
        value={field.value}
        onChange={(value) => field.onChange(value)}
        readOnly={
          fieldConfig.readOnly || (isEdit && fieldConfig.onEditReadOnly)
        }
        placeholder={getContextualText(fieldConfig.placeholder, isEdit)}
      />
    )
  }

  // Sino, usar Combobox estático
  return (
    <Combobox
      options={fieldConfig.options ?? []}
      value={field.value}
      onChange={(value) => field.onChange(value)}
      readOnly={fieldConfig.readOnly || (isEdit && fieldConfig.onEditReadOnly)}
    />
  )
}

/**
 * Renders the appropriate input based on field type
 */
const renderInputByType = <T extends FieldValues>(
  field: ControllerRenderProps<T, Path<T>>,
  fieldConfig: FormFieldConfig,
  isEdit: boolean,
) => {
  switch (fieldConfig.type) {
    case 'number':
      return renderNumberInput(field, fieldConfig, isEdit)
    case 'phone':
      return renderPhoneInput(field, fieldConfig, isEdit)
    case 'select':
      return renderSelectInput(field, fieldConfig, isEdit)
    default:
      return renderStandardInput(field, fieldConfig, isEdit)
  }
}

const FormFieldRenderer = <T extends FieldValues>({
  control,
  fieldConfig,
  isEdit = false,
}: FormFieldRendererProps<T>) => {
  const { errors: serverErrors } = usePage().props as {
    errors: Record<string, string>
  }

  // Memoize para evitar re-renders innecesarios
  const fieldError = useMemo(() => {
    return serverErrors?.[fieldConfig.name] || null
  }, [serverErrors, fieldConfig.name])

  // Mapeo de clases completas para Tailwind (necesario para que el compilador las detecte)
  const colspanClasses: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
  }

  const rowspanClasses: Record<number, string> = {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3',
    4: 'row-span-4',
    5: 'row-span-5',
    6: 'row-span-6',
  }

  const getGridClasses = () => {
    const classes = []
    if (fieldConfig.colspan) {
      classes.push(colspanClasses[fieldConfig.colspan] || '')
    }
    if (fieldConfig.rowspan) {
      classes.push(rowspanClasses[fieldConfig.rowspan] || '')
    }
    return classes.filter(Boolean).join(' ')
  }

  return (
    <div className={getGridClasses()}>
      <FormField
        control={control}
        disabled={fieldConfig.disabled}
        name={fieldConfig.name as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {fieldConfig.label}
              {isEdit && fieldConfig.optional && (
                <span className="ml-1 text-muted-foreground text-sm">
                  (optional)
                </span>
              )}
            </FormLabel>
            <FormControl>
              {renderInputByType(field, fieldConfig, isEdit)}
            </FormControl>
            {fieldError ? (
              <FormMessage>{fieldError}</FormMessage>
            ) : (
              <FormDescription>
                {getContextualText(fieldConfig.description, isEdit)}
              </FormDescription>
            )}
          </FormItem>
        )}
      />
    </div>
  )
}

export default FormFieldRenderer

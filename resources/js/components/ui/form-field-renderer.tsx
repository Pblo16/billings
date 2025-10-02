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
    disabled={fieldConfig.disabled || (isEdit && fieldConfig.onEditDisabled)}
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
    disabled={fieldConfig.disabled || (isEdit && fieldConfig.onEditDisabled)}
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
    disabled={fieldConfig.disabled || (isEdit && fieldConfig.onEditDisabled)}
  />
)

const renderSelectInput = <T extends FieldValues>(
  field: ControllerRenderProps<T, Path<T>>,
  fieldConfig: FormFieldConfig,
  isEdit: boolean,
) => {
  // Si tiene searchUrl o options, usar AsyncCombobox
  if (fieldConfig.searchUrl || fieldConfig.options) {
    return (
      <AsyncCombobox
        searchUrl={fieldConfig.searchUrl}
        options={fieldConfig.options}
        value={field.value}
        onChange={(value) => field.onChange(value)}
        readOnly={
          fieldConfig.readOnly || (isEdit && fieldConfig.onEditReadOnly)
        }
        placeholder={getContextualText(fieldConfig.placeholder, isEdit)}
        show={fieldConfig.show}
      />
    )
  }

  // Fallback a Combobox (aunque ya no debería llegar aquí)
  return (
    <Combobox
      options={[]}
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

  return (
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
  )
}

export default FormFieldRenderer

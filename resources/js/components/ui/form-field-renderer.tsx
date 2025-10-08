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
import { useMemo, useState } from 'react'
import {
  Control,
  ControllerRenderProps,
  FieldError,
  FieldErrors,
  FieldValues,
  Path,
} from 'react-hook-form'
import AppActionAlert from '../app-action-alert'
import { AsyncCombobox } from './async-combobox'
import { AsyncComboboxMultiple } from './async-combobox-multiple'
import { Combobox } from './combobox'
import FileUploadWithPreview from './file-upload-with-preview'

interface FormFieldRendererProps<T extends FieldValues> {
  control: Control<T>
  fieldConfig: FormFieldConfig
  isEdit?: boolean
  errors?: FieldErrors<Record<keyof T, FieldError>>
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
) => {
  // Para otros tipos de input, comportamiento normal
  return (
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
}

const renderFileInput = <T extends FieldValues>(
  field: ControllerRenderProps<T, Path<T>>,
  fieldConfig: FormFieldConfig,
  isEdit: boolean,
  onDeleteFile?: () => void,
) => {
  // Extraer información del archivo existente si está en formato string (path)
  const existingFileUrl =
    typeof field.value === 'string' ? field.value : undefined

  return (
    <FileUploadWithPreview
      value={field.value}
      onChange={(file) => field.onChange(file)}
      onDelete={onDeleteFile}
      accept={fieldConfig.mimeTypes?.join(', ')}
      placeholder={getContextualText(fieldConfig.placeholder, isEdit)}
      existingFileUrl={fieldConfig.existingFileUrl}
      existingFileName={fieldConfig.existingFileName}
      readOnly={fieldConfig.readOnly || (isEdit && fieldConfig.onEditReadOnly)}
      disabled={fieldConfig.disabled || (isEdit && fieldConfig.onEditDisabled)}
    />
  )
}

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
 * Renders a multi-select input with badges
 */
const renderMultiSelectInput = <T extends FieldValues>(
  field: ControllerRenderProps<T, Path<T>>,
  fieldConfig: FormFieldConfig,
  isEdit: boolean,
) => {
  return (
    <AsyncComboboxMultiple
      searchUrl={fieldConfig.searchUrl}
      options={fieldConfig.options}
      value={field.value}
      onChange={(value) => field.onChange(value)}
      readOnly={fieldConfig.readOnly || (isEdit && fieldConfig.onEditReadOnly)}
      placeholder={getContextualText(fieldConfig.placeholder, isEdit)}
      show={fieldConfig.show}
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
  onDeleteFile?: () => void,
) => {
  switch (fieldConfig.type) {
    case 'number':
      return renderNumberInput(field, fieldConfig, isEdit)
    case 'phone':
      return renderPhoneInput(field, fieldConfig, isEdit)
    case 'select':
      return renderSelectInput(field, fieldConfig, isEdit)
    case 'multi-select':
      return renderMultiSelectInput(field, fieldConfig, isEdit)
    case 'file':
    case 'image':
      return renderFileInput(field, fieldConfig, isEdit, onDeleteFile)
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

  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null)

  // Memoize para evitar re-renders innecesarios
  const fieldError = useMemo(() => {
    return serverErrors?.[fieldConfig.name] || null
  }, [serverErrors, fieldConfig.name])

  const handleDeleteFile = () => {
    // Construir URL de eliminación basada en el campo
    // Esto se puede personalizar según tu lógica
    if (fieldConfig.deleteUrl) {
      setDeleteUrl(fieldConfig.deleteUrl)
      setShowDeleteAlert(true)
    }
  }

  return (
    <>
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
              {renderInputByType(field, fieldConfig, isEdit, handleDeleteFile)}
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

      {/* Alert para confirmar eliminación */}
      <AppActionAlert
        query={deleteUrl}
        open={showDeleteAlert}
        setOpen={setShowDeleteAlert}
        title="Delete file?"
        description="Are you sure you want to delete this file? This action cannot be undone."
      />
    </>
  )
}

export default FormFieldRenderer

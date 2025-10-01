import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FormFieldConfig } from '@/types'
import { Control, FieldValues, Path } from 'react-hook-form'
import { NumberInput } from '@/components/ui/input-number'

interface FormFieldRendererProps<T extends FieldValues> {
  control: Control<T>
  fieldConfig: FormFieldConfig
  isEdit?: boolean
  errors?: Record<string, string | string[]>
}

const FormFieldRenderer = <T extends FieldValues>({
  control,
  fieldConfig,
  isEdit = false,
  errors = {},
}: FormFieldRendererProps<T>) => {
  return (
    <FormField
      control={control}
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
            {fieldConfig.type === 'number' ? (
              <NumberInput
                placeholder={
                  isEdit
                    ? fieldConfig.placeholder.edit
                    : fieldConfig.placeholder.create
                }
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                {...fieldConfig.numberInputProps}
              />
            ) : (
              <Input
                type={fieldConfig.type}
                placeholder={
                  isEdit
                    ? fieldConfig.placeholder.edit
                    : fieldConfig.placeholder.create
                }
                {...field}
                onChange={(e) => {
                  field.onChange(e.target.value)
                }}
                value={field.value ?? ''}
              />
            )}
          </FormControl>
          {errors[fieldConfig.name] ? (
            <FormMessage />
          ) : (
            <FormDescription>
              {isEdit
                ? fieldConfig.description.edit
                : fieldConfig.description.create}
            </FormDescription>
          )}
        </FormItem>
      )}
    />
  )
}

export default FormFieldRenderer
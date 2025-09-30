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

interface FormFieldRendererProps<T extends FieldValues> {
  control: Control<T>
  fieldConfig: FormFieldConfig
  isEdit?: boolean
  errors?: Record<string, any>
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
            <Input
              type={fieldConfig.type}
              placeholder={
                isEdit
                  ? fieldConfig.placeholder.edit
                  : fieldConfig.placeholder.create
              }
              {...field}
            />
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
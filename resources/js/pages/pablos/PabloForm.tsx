import FormGrid from '@/components/form-grid'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import FormFieldRenderer from '@/components/ui/form-field-renderer'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import { store } from '@/routes/pablo'
import { FormFieldConfig, Pablo } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const baseFormSchema = z.object({
  pablo: z.string().min(2).max(255)
})

const createFormSchema = z.object({
  pablo: z.string().min(2).max(255)
})

export type PabloFormData = z.infer<typeof baseFormSchema>

const formFieldsConfig: FormFieldConfig[] = [
  {
    name: 'pablo',
    label: 'Pablo',
    type: 'text',
    placeholder: {
      create: 'Enter Pablo',
      edit: 'Enter Pablo',
    },
    description: {
      create: 'This is the Pablo field.',
      edit: 'This is the Pablo field.',
    },
  }
]

interface PabloFormProps {
  data: Pablo | null
  isEdit?: boolean
  onSubmit?: (values: PabloFormData) => void
  submitButtonText?: string
}

const PabloForm = ({
  data,
  isEdit = false,
  onSubmit,
  submitButtonText = 'Submit',
}: PabloFormProps) => {
  const formSchema = isEdit ? baseFormSchema : createFormSchema

  const form = useForm<PabloFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pablo: data?.pablo || ''
    },
  })

  const { handleSubmit } = useFormSubmit<PabloFormData>({
    onSubmit,
    isEdit,
    entityId: data?.id,
    entityPath: store().url,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormGrid>
        {formFieldsConfig.map((fieldConfig) => (
          <FormFieldRenderer
            key={fieldConfig.name}
            control={form.control}
            fieldConfig={fieldConfig}
            isEdit={isEdit}
            errors={form.formState.errors}
          />
        ))}
        </FormGrid>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </form>
    </Form>
  )
}

export default PabloForm

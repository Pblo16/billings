import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import FormFieldRenderer from '@/components/ui/form-field-renderer'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import { store } from '@/routes/test/uno/pruebas'
import { FormFieldConfig, Prueba } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const baseFormSchema = z.object({
  name: z.string().min(2).max(50),
  // Agrega más campos según lo que necesite Prueba
})

const createFormSchema = z.object({
  name: z.string().min(2).max(50),
  // Campos obligatorios extra para "create"
})

export type PruebaFormData = z.infer<typeof baseFormSchema>

const formFieldsConfig: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: {
      create: 'Enter name',
      edit: 'Enter name',
    },
    description: {
      create: "This is the Prueba's display name.",
      edit: "This is the Prueba's display name.",
    },
  },
  // 🔧 Puedes duplicar/editar según tus necesidades (email, password, etc.)
]

interface PruebaFormProps {
  data: Prueba | null
  isEdit?: boolean
  onSubmit?: (values: PruebaFormData) => void
  submitButtonText?: string
}

const PruebaForm = ({
  data,
  isEdit = false,
  onSubmit,
  submitButtonText = 'Submit',
}: PruebaFormProps) => {
  const formSchema = isEdit ? baseFormSchema : createFormSchema

  const form = useForm<PruebaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || '',
      // agrega más defaultValues según corresponda
    },
  })

  const { handleSubmit } = useFormSubmit<PruebaFormData>({
    onSubmit,
    isEdit,
    entityId: data?.id,
    entityPath: store().url,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {formFieldsConfig.map((fieldConfig) => (
          <FormFieldRenderer
            key={fieldConfig.name}
            control={form.control}
            fieldConfig={fieldConfig}
            isEdit={isEdit}
            errors={form.formState.errors}
          />
        ))}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </form>
    </Form>
  )
}

export default PruebaForm

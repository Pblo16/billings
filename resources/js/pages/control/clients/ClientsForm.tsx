import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import FormFieldRenderer from '@/components/ui/form-field-renderer'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import { store } from '@/routes/control/clients'
import { Clients, FormFieldConfig } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const baseFormSchema = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().optional(),
})

const createFormSchema = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().optional(),
})

export type ClientsFormData = z.infer<typeof baseFormSchema>

const formFieldsConfig: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: {
      create: 'Enter Name',
      edit: 'Enter Name',
    },
    description: {
      create: 'This is the Name field.',
      edit: 'This is the Name field.',
    },
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'phone',
    placeholder: {
      create: 'Enter Phone',
      edit: 'Enter Phone',
    },
    description: {
      create: 'This is the Phone field.',
      edit: 'This is the Phone field.',
    },
    optional: true,
  },
]

interface ClientsFormProps {
  data: Clients | null
  isEdit?: boolean
  onSubmit?: (values: ClientsFormData) => void
  submitButtonText?: string
}

const ClientsForm = ({
  data,
  isEdit = false,
  onSubmit,
  submitButtonText = 'Submit',
}: ClientsFormProps) => {
  const formSchema = isEdit ? baseFormSchema : createFormSchema

  const form = useForm<ClientsFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || '',
      phone: data?.phone || '',
    },
  })

  const { handleSubmit } = useFormSubmit<ClientsFormData>({
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

export default ClientsForm

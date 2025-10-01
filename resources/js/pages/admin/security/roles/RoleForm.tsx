import FormGrid from '@/components/form-grid'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import FormFieldRenderer from '@/components/ui/form-field-renderer'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import { store } from '@/routes/admin/security/role'
import { FormFieldConfig, Role } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const baseFormSchema = z.object({
  name: z.string().min(2).max(255),
  guard_name: z.string().min(2).max(255),
})

const createFormSchema = z.object({
  name: z.string().min(2).max(255),
  guard_name: z.string().min(2).max(255),
})

export type RoleFormData = z.infer<typeof baseFormSchema>

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
    name: 'guard_name',
    label: 'Guard name',
    type: 'text',
    placeholder: {
      create: 'Enter Guard name',
      edit: 'Enter Guard name',
    },
    description: {
      create: 'This is the Guard name field.',
      edit: 'This is the Guard name field.',
    },
  },
]

interface RoleFormProps {
  data: Role | null
  isEdit?: boolean
  onSubmit?: (values: RoleFormData) => void
  submitButtonText?: string
}

const RoleForm = ({
  data,
  isEdit = false,
  onSubmit,
  submitButtonText = 'Submit',
}: RoleFormProps) => {
  const formSchema = isEdit ? baseFormSchema : createFormSchema

  const form = useForm<RoleFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || '',
      guard_name: data?.guard_name || '',
    },
  })

  const { handleSubmit } = useFormSubmit<RoleFormData>({
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

export default RoleForm

import FormGrid from '@/components/form-grid'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import FormFieldRenderer from '@/components/ui/form-field-renderer'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import { store } from '@/routes/users'
import { FormFieldConfig, UserWithAvatar } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const baseFormSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.email(),
  password: z.string().optional(),
})

const createFormSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type UserFormData = z.infer<typeof baseFormSchema>

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
      create: "This is the user's display name.",
      edit: "This is the user's display name.",
    },
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: {
      create: 'user@example.com',
      edit: 'user@example.com',
    },
    description: {
      create: "Enter the user's email address.",
      edit: "Enter the user's email address.",
    },
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: {
      create: 'Enter password',
      edit: 'Leave blank to keep current password',
    },
    description: {
      create: "Enter the user's password (minimum 8 characters).",
      edit: 'Leave empty to keep the current password, or enter a new one to change it.',
    },
    optional: true,
  },
]

interface UserFormProps {
  data: UserWithAvatar | null
  isEdit?: boolean
  onSubmit?: (values: UserFormData) => void
  submitButtonText?: string
}

const UserForm = ({
  data,
  isEdit = false,
  onSubmit,
  submitButtonText = 'Submit',
}: UserFormProps) => {
  const formSchema = isEdit ? baseFormSchema : createFormSchema

  const form = useForm<UserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || '',
      email: data?.email || '',
      password: data?.password || '',
    },
  })

  const { handleSubmit } = useFormSubmit<UserFormData>({
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

export default UserForm

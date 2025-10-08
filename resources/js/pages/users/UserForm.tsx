import FormGrid from '@/components/form-grid'
import { Form } from '@/components/ui/form'
import FormFieldRenderer from '@/components/ui/form-field-renderer'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import { paginated as rolesApi } from '@/routes/api/security/roles'
import { store } from '@/routes/users'
import { deleteMethod } from '@/routes/users/documents'
import { FormFieldConfig, UserFormData, UserWithAvatar } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const baseFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().optional(),
  roles: z
    .array(
      z.union([z.number(), z.string().transform((val) => parseInt(val, 10))]),
    )
    .optional(),
  cv: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
})

const createFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roles: z
    .array(
      z.union([z.number(), z.string().transform((val) => parseInt(val, 10))]),
    )
    .optional(),
  cv: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
})

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
  {
    name: 'roles',
    label: 'Roles',
    type: 'multi-select',
    placeholder: {
      create: 'Select roles',
      edit: 'Select roles',
    },
    description: {
      create: 'Assign roles to the user.',
      edit: 'Modify the user roles as needed.',
    },
    optional: true,
    searchUrl: rolesApi({ query: { format: 'combobox' } }).url,
    show: 5,
  },
  {
    name: 'cv',
    label: 'CV',
    type: 'file',
    mimeTypes: ['application/pdf'],
    maxFileSizeMB: 10,
    placeholder: {
      create: 'Upload CV',
      edit: 'Update CV',
    },
    description: { create: 'Upload the user CV.', edit: 'Update the user CV.' },
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
      roles: data?.roles?.map((role) => role.id) || undefined,
      cv: data?.documents?.[0]?.path || undefined,
    },
  })

  const { handleSubmit } = useFormSubmit({
    onSubmit,
    isEdit,
    entityId: data?.id,
    entityPath: store().url,
  })

  // Enriquecer la configuración del campo 'cv' con datos del documento existente
  const enrichedFormFields = formFieldsConfig.map((fieldConfig) => {
    if (fieldConfig.name === 'cv' && data?.documents?.[0]) {
      return {
        ...fieldConfig,
        existingFileName: data.documents[0].name,
        existingFileUrl: data.documents[0].url,
        deleteUrl: deleteMethod.url({
          user: data.id,
          document: data.documents[0].id,
        }),
      }
    }
    return fieldConfig
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormGrid
          isSubmitting={form.formState.isSubmitting}
          submitButtonText={submitButtonText}
        >
          {enrichedFormFields.map((fieldConfig) => (
            <FormFieldRenderer
              key={fieldConfig.name}
              control={form.control}
              fieldConfig={fieldConfig}
              isEdit={isEdit}
              errors={form.formState.errors}
            />
          ))}
        </FormGrid>
      </form>
    </Form>
  )
}

export default UserForm

import FormGrid from '@/components/form-grid'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import FormFieldRenderer from '@/components/ui/form-field-renderer'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import { store } from '@/routes/global/post'
import { FormFieldConfig, Post } from '@/types'

import { zodResolver } from '@hookform/resolvers/zod'
import { usePage } from '@inertiajs/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
const baseFormSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255),
  text: z.string().optional(),
  user_id: z.number(),
})

const createFormSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255),
  text: z.string().optional(),
  user_id: z.number(),
})

export type PostFormData = z.infer<typeof baseFormSchema>

const getFormFieldsConfig = (
  users: { value: string; label: string }[],
): FormFieldConfig[] => [
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
    name: 'slug',
    label: 'Slug (read-only)',
    type: 'text',
    readOnly: true,
    placeholder: {
      create: 'Enter Slug',
      edit: 'Enter Slug',
    },
    description: {
      create: 'This is the Slug field.',
      edit: 'This is the Slug field.',
    },
  },
  {
    name: 'text',
    label: 'Text',
    type: 'text',
    placeholder: {
      create: 'Enter Text',
      edit: 'Enter Text',
    },
    description: {
      create: 'This is the Text field.',
      edit: 'This is the Text field.',
    },
  },
  {
    name: 'user_id',
    label: 'User id',
    type: 'select',
    placeholder: {
      create: 'Select a user',
      edit: 'Select a user',
    },
    description: {
      create: 'Search and select a user.',
      edit: 'Search and select a user.',
    },
    options: users, // Opciones iniciales (5 primeros)
    searchUrl: '/global/post/search-users', // URL para búsqueda dinámica
    onEditReadOnly: true,
    colspan: 3,
  },
]

interface PostFormProps {
  data: Post | null
  isEdit?: boolean
  onSubmit?: (values: PostFormData) => void
  submitButtonText?: string
}

const PostForm = ({
  data,
  isEdit = false,
  onSubmit,
  submitButtonText = 'Submit',
}: PostFormProps) => {
  const { props } = usePage()
  const users = (props.users as { value: string; label: string }[]) || []
  const formFieldsConfig = getFormFieldsConfig(users)

  const formSchema = isEdit ? baseFormSchema : createFormSchema

  const form = useForm<PostFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || '',
      slug: data?.slug || crypto.randomUUID(),
      text: data?.text || '',
      user_id: data?.user_id || undefined,
    },
  })

  const { handleSubmit } = useFormSubmit<PostFormData>({
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

export default PostForm

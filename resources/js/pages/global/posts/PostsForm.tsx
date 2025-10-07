import FormGrid from '@/components/form-grid'
import { Form } from '@/components/ui/form'
import FormFieldRenderer from '@/components/ui/form-field-renderer'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import { paginated } from '@/routes/api/users'
import { store } from '@/routes/global/posts'
import { FormFieldConfig, Posts, PostsFormData, SharedData } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePage } from '@inertiajs/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const baseFormSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255),
  text: z.string().optional(),
  user_id: z.number(),
  colaborators: z
    .array(
      z.union([z.number(), z.string().transform((val) => parseInt(val, 10))]),
    )
    .optional(),
})

const createFormSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255),
  text: z.string().optional(),
  user_id: z.number(),
  colaborators: z
    .array(
      z.union([z.number(), z.string().transform((val) => parseInt(val, 10))]),
    )
    .optional(),
})

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
    name: 'slug',
    label: 'Slug',
    type: 'text',
    placeholder: {
      create: 'Enter Slug',
      edit: 'Enter Slug',
    },
    description: {
      create: 'This is the Slug field.',
      edit: 'This is the Slug field.',
    },
    onEditDisabled: true,
    readOnly: true,
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
      create: 'Search user...',
      edit: 'Search user...',
    },
    description: {
      create: 'Search and select a user.',
      edit: 'Search and select a user.',
    },
    searchUrl: paginated().url,
    show: 5, // Mostrar 10 resultados en la búsqueda
  },

  {
    name: 'colaborators',
    label: 'Colaborators',
    type: 'multi-select',
    placeholder: {
      create: 'Search user...',
      edit: 'Search user...',
    },
    description: {
      create: 'Search and select a user.',
      edit: 'Search and select a user.',
    },
    searchUrl: paginated({ query: { format: 'combobox' } }).url,
    show: 5, // Mostrar 10 resultados en la búsqueda
  },
]

interface PostsFormProps {
  data: Posts | null
  isEdit?: boolean
  onSubmit?: (values: PostsFormData) => void
  submitButtonText?: string
}

const PostsForm = ({
  data,
  isEdit = false,
  onSubmit,
  submitButtonText = 'Submit',
}: PostsFormProps) => {
  const formSchema = isEdit ? baseFormSchema : createFormSchema
  const { auth } = usePage<SharedData>().props

  const form = useForm<PostsFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || '',
      slug: data?.slug || crypto.randomUUID(),
      text: data?.text || '',
      user_id: data?.user?.id || auth.user.id,
      colaborators: data?.details
        ? data.details
            .map((detail) => detail.colaborator?.id)
            .filter((id) => typeof id === 'number')
        : [],
    },
  })

  const { handleSubmit } = useFormSubmit<PostsFormData>({
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
      </form>
    </Form>
  )
}

export default PostsForm

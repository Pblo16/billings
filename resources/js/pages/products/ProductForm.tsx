import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import FormFieldRenderer from '@/components/ui/form-field-renderer'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import { store } from '@/routes/products'
import { FormFieldConfig, Product } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const baseFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0).optional(),
})

const createFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0).optional(),
})

export type ProductFormData = z.infer<typeof baseFormSchema>

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
    name: 'price',
    label: 'Price',
    type: 'number',
    placeholder: {
      create: 'Enter Price',
      edit: 'Enter Price',
    },
    description: {
      create: 'Enter the product price.',
      edit: 'Update the product price.',
    },
    numberInputProps: {
      stepper: 0.5, // Incremento/decremento de 0.5
      thousandSeparator: ',', // Separador de miles
      min: 0, // Valor mínimo
      max: 999999, // Valor máximo
      prefix: '$', // Prefijo ($)
      decimalScale: 2, // Escala decimal (2 decimales)
      fixedDecimalScale: true, // Siempre mostrar 2 decimales
    },
  },
]

interface ProductFormProps {
  data: Product | null
  isEdit?: boolean
  onSubmit?: (values: ProductFormData) => void
  submitButtonText?: string
}

const ProductForm = ({
  data,
  isEdit = false,
  onSubmit,
  submitButtonText = 'Submit',
}: ProductFormProps) => {
  const formSchema = isEdit ? baseFormSchema : createFormSchema

  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || '',
      price: data?.price ? Number(data.price) : 0,
    },
  })

  const { handleSubmit } = useFormSubmit<ProductFormData>({
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

export default ProductForm

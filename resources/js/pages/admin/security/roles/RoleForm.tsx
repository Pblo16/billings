import FormGrid from '@/components/form-grid'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import FormFieldRenderer from '@/components/ui/form-field-renderer'
import useFetch from '@/hooks/use-fetch'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import { store } from '@/routes/admin/security/role'
import { permissions } from '@/routes/api/security'
import { FormFieldConfig, PermissionGroup, Role } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const baseFormSchema = z.object({
  name: z.string().min(2).max(255),
  // guard_name: z.string().min(2).max(255),
  permissions: z.array(z.number()).optional(),
})

const createFormSchema = z.object({
  name: z.string().min(2).max(255),
  // guard_name: z.string().min(2).max(255),
  permissions: z.array(z.number()).optional(),
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
  // {
  //   name: 'guard_name',
  //   label: 'Guard name',
  //   type: 'text',
  //   placeholder: {
  //     create: 'Enter Guard name',
  //     edit: 'Enter Guard name',
  //   },
  //   description: {
  //     create: 'This is the Guard name field.',
  //     edit: 'This is the Guard name field.',
  //   },
  // },
]

interface RoleFormProps {
  data: Role | null
  isEdit?: boolean
  onSubmit?: (values: RoleFormData) => void
  submitButtonText?: string
}

const renderExtraFields = (form: any) => {
  const categories = useFetch<PermissionGroup[]>(permissions().url)
  // Aquí puedes agregar lógica para renderizar campos adicionales según si es edición o creación
  return (
    <>
      {categories.data && categories.data.length > 0 && (
        <div className="">
          <h3 className="mb-4 font-medium text-lg">Permissions</h3>
          <FormField
            control={form.control}
            name="permissions"
            render={({ field }) => (
              <div className="space-y-6">
                {categories.data?.map((group) => (
                  <div key={group.category}>
                    <h4 className="mb-2 font-semibold text-md">
                      {group.category}
                    </h4>
                    <div className="gap-4 grid grid-cols-3">
                      {group.permissions.map((permission) => (
                        <FormItem
                          key={permission.id}
                          className="flex items-center space-x-2"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || []
                                return checked
                                  ? field.onChange([
                                      ...currentValue,
                                      permission.id,
                                    ])
                                  : field.onChange(
                                      currentValue.filter(
                                        (value: number) =>
                                          value !== permission.id,
                                      ),
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {permission.name}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </div>
      )}
    </>
  )
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
      permissions: data?.permissions_ids || [],
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
        <FormGrid ext={renderExtraFields(form)}>
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

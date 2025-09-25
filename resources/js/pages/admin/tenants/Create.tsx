import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from '@inertiajs/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Tenants',
    href: '/tenants',
  },
  {
    title: 'Create',
    href: '',
  },
]

const formSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
})

type TenantFormData = z.infer<typeof formSchema>

const Edit = () => {
  const form = useForm<TenantFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      is_active: true,
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: TenantFormData) {
    return router.post(`/tenants`, values)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <h1>Create Tenant</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Mi Empresa SA" {...field} />
                </FormControl>
                <FormDescription>Nombre público del tenant.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="mi-empresa" {...field} />
                </FormControl>
                <FormDescription>
                  Identificador único (solo letras minúsculas, números y
                  guiones).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Descripción del tenant (opcional)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Descripción opcional del tenant.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </AppLayout>
  )
}

export default Edit

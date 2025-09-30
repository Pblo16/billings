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
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from '@inertiajs/react'
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

interface UserFormProps {
  user?: {
    id?: number
    name?: string
    email?: string
    password?: string
  }
  isEdit?: boolean
  onSubmit?: (values: UserFormData) => void
  submitButtonText?: string
}

const UserForm = ({
  user,
  isEdit = false,
  onSubmit,
  submitButtonText = 'Submit',
}: UserFormProps) => {
  const formSchema = isEdit ? baseFormSchema : createFormSchema

  const form = useForm<UserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: user?.password || '',
    },
  })

  const handleSubmit = (values: UserFormData) => {
    if (onSubmit) {
      onSubmit(values)
    } else {
      // Default behavior
      if (isEdit && user?.id) {
        router.put(`/users/${user.id}`, values)
      } else {
        router.post('/users', values)
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              {form.formState.errors.name ? (
                <FormMessage />
              ) : (
                <FormDescription>
                  This is the user's display name.
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="user@example.com" {...field} />
              </FormControl>
              {form.formState.errors.email ? (
                <FormMessage />
              ) : (
                <FormDescription>
                  Enter the user's email address.
                </FormDescription>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Password{' '}
                {isEdit && (
                  <span className="text-muted-foreground text-sm">
                    (optional)
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={
                    isEdit
                      ? 'Leave blank to keep current password'
                      : 'Enter password'
                  }
                  {...field}
                />
              </FormControl>
              {form.formState.errors.password ? (
                <FormMessage />
              ) : (
                <FormDescription>
                  {isEdit
                    ? 'Leave empty to keep the current password, or enter a new one to change it.'
                    : "Enter the user's password (minimum 8 characters)."}
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </form>
    </Form>
  )
}

export default UserForm

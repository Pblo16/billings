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

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
})

export type UserFormData = z.infer<typeof formSchema>

interface UserFormProps {
  user?: {
    id?: number
    name?: string
    email?: string
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
  const form = useForm<UserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
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
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </form>
    </Form>
  )
}

export default UserForm

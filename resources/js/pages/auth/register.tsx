import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController'
import { login } from '@/routes'
import { Form, Head, usePage } from '@inertiajs/react'
import { LoaderCircle } from 'lucide-react'

import InputError from '@/components/input-error'
import TextLink from '@/components/text-link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthLayout from '@/layouts/auth-layout'
import { SharedData } from '@/types'

export default function Register() {
  const { tenant } = usePage<SharedData>().props

  return (
    <AuthLayout
      title={'Create an account' + (tenant ? ` - Tenant: ${tenant.id}` : '')}
      description="Enter your details below to create your account"
    >
      <Head title="Register" />
      <Form
        {...RegisteredUserController.store.form()}
        resetOnSuccess={['password', 'password_confirmation']}
        disableWhileProcessing
        className="flex flex-col gap-6"
      >
        {({ processing, errors }) => (
          <>
            <div className="gap-6 grid">
              <div className="gap-2 grid">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  autoFocus
                  tabIndex={1}
                  autoComplete="name"
                  name="name"
                  placeholder="Full name"
                />
                <InputError message={errors.name} className="mt-2" />
              </div>

              <div className="gap-2 grid">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  tabIndex={2}
                  autoComplete="email"
                  name="email"
                  placeholder="email@example.com"
                />
                <InputError message={errors.email} />
              </div>

              <div className="gap-2 grid">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  tabIndex={3}
                  autoComplete="new-password"
                  name="password"
                  placeholder="Password"
                />
                <InputError message={errors.password} />
              </div>

              <div className="gap-2 grid">
                <Label htmlFor="password_confirmation">Confirm password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  required
                  tabIndex={4}
                  autoComplete="new-password"
                  name="password_confirmation"
                  placeholder="Confirm password"
                />
                <InputError message={errors.password_confirmation} />
              </div>

              <Button
                type="submit"
                className="mt-2 w-full"
                tabIndex={5}
                data-test="register-user-button"
              >
                {processing && (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                )}
                Create account
              </Button>
            </div>

            <div className="text-muted-foreground text-sm text-center">
              Already have an account?{' '}
              <TextLink href={login()} tabIndex={6}>
                Log in
              </TextLink>
            </div>
          </>
        )}
      </Form>
    </AuthLayout>
  )
}

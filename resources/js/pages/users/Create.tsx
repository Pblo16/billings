import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types'
import UserForm from './UserForm'
import AppForm from '@/components/app-form'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Users',
    href: '/users',
  },
  {
    title: 'Create',
    href: '',
  },
]

const Create = () => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <h1>Create User</h1>
      <AppForm>
        <UserForm submitButtonText="Create User" />
      </AppForm>
    </AppLayout>
  )
}

export default Create

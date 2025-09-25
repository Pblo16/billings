import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types'
import UserForm from './UserForm'

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
      <UserForm submitButtonText="Create User" />
    </AppLayout>
  )
}

export default Create

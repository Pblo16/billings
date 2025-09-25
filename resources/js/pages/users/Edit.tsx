import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types'
import UserForm from './UserForm'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Users',
    href: '/users',
  },
  {
    title: 'Edit',
    href: '',
  },
]

const Edit = ({ data }: { data: any }) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <h1>Edit User</h1>
      <UserForm user={data} isEdit submitButtonText="Update User" />
    </AppLayout>
  )
}

export default Edit

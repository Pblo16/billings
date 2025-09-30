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
    title: 'Edit',
    href: '',
  },
]

const Edit = ({ data }: { data: any }) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <h1>Edit User</h1>
      <AppForm>
        <UserForm user={data} isEdit submitButtonText="Update User" />
      </AppForm>
    </AppLayout>
  )
}

export default Edit

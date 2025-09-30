import AppForm from '@/components/app-form'
import UpsertShell from '@/components/upsert-shell'
import { BreadcrumbItem } from '@/types'
import UserForm from './UserForm'

interface UpsertProps {
  data?: any
  mode?: 'create' | 'edit'
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Users',
    href: '/users',
  },
]

const Upsert = ({ data, mode = 'create' }: UpsertProps) => {
  const isEdit = mode === 'edit'

  const pageCrumbs: BreadcrumbItem[] = [
    ...breadcrumbs,
    { title: isEdit ? 'Edit' : 'Create', href: '' },
  ]

  return (
    <UpsertShell
      title={isEdit ? 'Edit User' : 'Create User'}
      breadcrumbs={pageCrumbs}
      mode={mode}
      data={data}
      childPropName="user"
      submitButtonText={(edit) => (edit ? 'Update User' : 'Create User')}
    >
      <AppForm>{<UserForm isEdit={isEdit} user={data} />}</AppForm>
    </UpsertShell>
  )
}

export default Upsert

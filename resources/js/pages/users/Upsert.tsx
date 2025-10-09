import UpsertShell from '@/components/upsert-shell'
import { BreadcrumbItem, UserWithAvatar } from '@/types'
import UserForm from './UserForm'

interface UpsertProps {
  data?: UserWithAvatar
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
      breadcrumbs={pageCrumbs}
      mode={mode}
      data={data as unknown as Record<string, unknown>}
      childPropName="user"
      submitButtonText={(edit) => (edit ? 'Update User' : 'Create User')}
    >
      <UserForm isEdit={isEdit} data={data ?? null} />
    </UpsertShell>
  )
}

export default Upsert

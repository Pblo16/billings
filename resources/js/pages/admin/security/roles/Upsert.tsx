import UpsertShell from '@/components/upsert-shell'
import { role } from '@/routes/admin/security/'
import { BreadcrumbItem, Role } from '@/types'
import RoleForm from './RoleForm'

interface UpsertProps {
  data?: Role
  mode?: 'create' | 'edit'
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Roles',
    href: role().url,
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
      childPropName="role"
      submitButtonText={(edit) => (edit ? 'Update Role' : 'Create Role')}
    >
      <RoleForm isEdit={isEdit} data={data ?? null} />
    </UpsertShell>
  )
}

export default Upsert

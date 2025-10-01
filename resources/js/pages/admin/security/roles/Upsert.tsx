import AppForm from '@/components/app-form'
import UpsertShell from '@/components/upsert-shell'
import { BreadcrumbItem } from '@/types'
import RoleForm from './RoleForm'
import { role }  from '@/routes/admin/security/'

interface UpsertProps {
  data?: any
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
      title={isEdit ? 'Edit Role' : 'Create Role'}
      breadcrumbs={pageCrumbs}
      mode={mode}
      data={data}
      childPropName="role"
      submitButtonText={(edit) =>
        edit ? 'Update Role' : 'Create Role'
      }
    >
      <AppForm>
        <RoleForm isEdit={isEdit} data={data} />
      </AppForm>
    </UpsertShell>
  )
}

export default Upsert

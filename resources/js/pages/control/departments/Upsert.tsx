import AppForm from '@/components/app-form'
import UpsertShell from '@/components/upsert-shell'
import { departments } from '@/routes/control/'
import { BreadcrumbItem } from '@/types'
import DepartmentsForm from './DepartmentsForm'

interface UpsertProps {
  data?: any
  mode?: 'create' | 'edit'
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Departments',
    href: departments().url,
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
      title={isEdit ? 'Edit Departments' : 'Create Departments'}
      breadcrumbs={pageCrumbs}
      mode={mode}
      data={data}
      childPropName="departments"
      submitButtonText={(edit) =>
        edit ? 'Update Departments' : 'Create Departments'
      }
    >
      <AppForm>
        <DepartmentsForm isEdit={isEdit} data={data} />
      </AppForm>
    </UpsertShell>
  )
}

export default Upsert

import AppForm from '@/components/app-form'
import UpsertShell from '@/components/upsert-shell'
import { BreadcrumbItem } from '@/types'
import PabloForm from './PabloForm'
import { pablo }  from '@/routes/'

interface UpsertProps {
  data?: any
  mode?: 'create' | 'edit'
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Pablos',
    href: pablo().url,
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
      title={isEdit ? 'Edit Pablo' : 'Create Pablo'}
      breadcrumbs={pageCrumbs}
      mode={mode}
      data={data}
      childPropName="pablo"
      submitButtonText={(edit) =>
        edit ? 'Update Pablo' : 'Create Pablo'
      }
    >
      <AppForm>
        <PabloForm isEdit={isEdit} data={data} />
      </AppForm>
    </UpsertShell>
  )
}

export default Upsert

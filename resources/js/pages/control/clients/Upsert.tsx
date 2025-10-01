import AppForm from '@/components/app-form'
import UpsertShell from '@/components/upsert-shell'
import { clients } from '@/routes/control/'
import { BreadcrumbItem } from '@/types'
import ClientsForm from './ClientsForm'

interface UpsertProps {
  data?: any
  mode?: 'create' | 'edit'
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Clients',
    href: clients().url,
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
      title={isEdit ? 'Edit Clients' : 'Create Clients'}
      breadcrumbs={pageCrumbs}
      mode={mode}
      data={data}
      childPropName="clients"
      submitButtonText={(edit) => (edit ? 'Update Clients' : 'Create Clients')}
    >
      <AppForm>
        <ClientsForm isEdit={isEdit} data={data} />
      </AppForm>
    </UpsertShell>
  )
}

export default Upsert

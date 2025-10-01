import AppForm from '@/components/app-form'
import UpsertShell from '@/components/upsert-shell'
import { provider } from '@/routes/control/'
import { BreadcrumbItem } from '@/types'
import ProviderForm from './ProviderForm'

interface UpsertProps {
  data?: any
  mode?: 'create' | 'edit'
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Providers',
    href: provider().url,
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
      title={isEdit ? 'Edit Provider' : 'Create Provider'}
      breadcrumbs={pageCrumbs}
      mode={mode}
      data={data}
      childPropName="provider"
      submitButtonText={(edit) =>
        edit ? 'Update Provider' : 'Create Provider'
      }
    >
      <AppForm>
        <ProviderForm isEdit={isEdit} data={data} />
      </AppForm>
    </UpsertShell>
  )
}

export default Upsert

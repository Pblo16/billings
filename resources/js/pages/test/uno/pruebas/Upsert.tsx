import AppForm from '@/components/app-form'
import UpsertShell from '@/components/upsert-shell'
import { BreadcrumbItem } from '@/types'
import PruebaForm from './PruebaForm'

interface UpsertProps {
  data?: any
  mode?: 'create' | 'edit'
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Test/Uno/Pruebas',
    href: '/test/uno/pruebas',
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
      title={isEdit ? 'Edit Prueba' : 'Create Prueba'}
      breadcrumbs={pageCrumbs}
      mode={mode}
      data={data}
      childPropName="{{nameLower}}"
      submitButtonText={(edit) =>
        edit ? 'Update Prueba' : 'Create Prueba'
      }
    >
      <AppForm>
        <PruebaForm isEdit={isEdit} data={data} />
      </AppForm>
    </UpsertShell>
  )
}

export default Upsert

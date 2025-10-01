import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/test/uno/pruebas/columns'
import { create } from '@/routes/test/uno/pruebas'
import { type BreadcrumbItem, type Prueba } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Prueba',
    href: '/test/uno/pruebas',
  },
]

const headerActions = [
  {
    label: 'New Prueba',
    href: create().url,
    variant: 'outline' as const,
  },
]

const PruebaIndex = (props: { data: Prueba[] }) => {
  const { data } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable columns={columns} data={data} header={headerActions} />
    </AppLayout>
  )
}

export default PruebaIndex

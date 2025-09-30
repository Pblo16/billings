import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/test/pruebas/columns'
import { create } from '@/routes/test/pruebas'
import { type BreadcrumbItem, type Prueba } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Test/Pruebas',
    href: '/test/pruebas',
  },
]

const headerActions = [
  {
    label: 'New Prueba',
    href: create().url,
    variant: 'outline' as const,
  },
  {
    label: 'Open modal',
    href: '/test/pruebas/bulk-actions',
    variant: 'secondary' as const,
  },
]

const Test/PruebasIndex = (props: { data: Prueba[] }) => {
  const { data } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable columns={columns} data={data} header={headerActions} />
    </AppLayout>
  )
}

export default Test/PruebasIndex

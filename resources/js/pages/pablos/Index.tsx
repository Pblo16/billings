import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/pablos/columns'
import { create } from '@/routes/pablo'
import { type BreadcrumbItem, type Pablo } from '@/types'
import { pablo }  from '@/routes/'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Pablo',
    href: pablo().url,
  },
]

const headerActions = [
  {
    label: 'New Pablo',
    href: create().url,
    variant: 'outline' as const,
  },
]

const PabloIndex = (props: { data: Pablo[] }) => {
  const { data } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable columns={columns} data={data ?? null} header={headerActions} />
    </AppLayout>
  )
}

export default PabloIndex

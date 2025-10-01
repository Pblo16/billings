import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/control/clients/columns'
import { create } from '@/routes/control/clients'
import { type BreadcrumbItem, type Clients } from '@/types'
import { clients }  from '@/routes/control/'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Clients',
    href: clients().url,
  },
]

const headerActions = [
  {
    label: 'New Clients',
    href: create().url,
    variant: 'outline' as const,
  },
]

const ClientsIndex = (props: { data: Clients[] }) => {
  const { data } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable columns={columns} data={data ?? null} header={headerActions} />
    </AppLayout>
  )
}

export default ClientsIndex

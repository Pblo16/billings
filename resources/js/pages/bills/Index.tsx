import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/bills/columns'
import { type BreadcrumbItem, type User } from '@/types'
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/bills',
  },
]

const BillsIndex = (props: { data: User[] }) => {
  const { data } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable columns={columns} data={data} />
    </AppLayout>
  )
}

export default BillsIndex

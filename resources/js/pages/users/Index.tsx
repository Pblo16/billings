import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/bills/columns'
import { create } from '@/routes/users'
import { type BreadcrumbItem, type User } from '@/types'
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Users',
    href: '/users',
  },
]

const UsersIndex = (props: { data: User[] }) => {
  const { data } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable columns={columns} data={data} route={create().url} />
    </AppLayout>
  )
}

export default UsersIndex

import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/users/columns'
import { type BreadcrumbItem, type User } from '@/types'
import { create } from '@/routes/users'

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
      <DataTable columns={columns} data={data} route={create().url}  />
    </AppLayout>
  )
}

export default UsersIndex

import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/users/columns'
import { users } from '@/routes'
import { create } from '@/routes/users'
import { type BreadcrumbItem, type User } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Users',
    href: users().url,
  },
]

const headerActions = [
  {
    label: 'New User',
    href: create().url,
  },
]

const UsersIndex = (props: { data: User[] }) => {
  const { data } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable columns={columns} data={data} header={headerActions} />
    </AppLayout>
  )
}

export default UsersIndex

import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/admin/security/roles/columns'
import { role } from '@/routes/admin/security/'
import { create } from '@/routes/admin/security/role'
import { type BreadcrumbItem, type Role } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Role',
    href: role().url,
  },
]

const headerActions = [
  {
    label: 'New Role',
    href: create().url,
    variant: 'outline' as const,
  },
]

const RoleIndex = (props: { data: Role[] }) => {
  const { data } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable columns={columns} data={data ?? null} header={headerActions} />
    </AppLayout>
  )
}

export default RoleIndex

import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/admin/tenants/columns'
import { create } from '@/routes/tenants'
import { type BreadcrumbItem } from '@/types'
import { Tenant } from '@/types/tenant'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Tenants',
    href: '/tenants',
  },
]

const TenantsIndex = (props: { data: Tenant[] }) => {
  const { data } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable columns={columns} data={data} route={create.url()} />
    </AppLayout>
  )
}

export default TenantsIndex

import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/control/departments/columns'
import { create } from '@/routes/control/departments'
import { type BreadcrumbItem, type Departments } from '@/types'
import { departments }  from '@/routes/control/'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Departments',
    href: departments().url,
  },
]

const headerActions = [
  {
    label: 'New Departments',
    href: create().url,
    variant: 'outline' as const,
  },
]

const DepartmentsIndex = (props: { data: Departments[] }) => {
  const { data } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable columns={columns} data={data ?? null} header={headerActions} />
    </AppLayout>
  )
}

export default DepartmentsIndex

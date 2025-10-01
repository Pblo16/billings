import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/control/providers/columns'
import { provider } from '@/routes/control'
import { create } from '@/routes/control/provider'
import { type BreadcrumbItem, type Provider } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Provider',
    href: provider().url,
  },
]

const headerActions = [
  {
    label: 'New Provider',
    href: create().url,
    variant: 'outline' as const,
  },
]

const ProviderIndex = (props: { data: Provider[] }) => {
  const { data } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable columns={columns} data={data ?? null} header={headerActions} />
    </AppLayout>
  )
}

export default ProviderIndex

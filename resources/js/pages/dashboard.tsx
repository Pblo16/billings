import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import { type BreadcrumbItem } from '@/types'
import { Head, usePage } from '@inertiajs/react'
import { type SharedData } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard().url,
  },
]

export default function Dashboard() {
  const { tenant } = usePage<SharedData>().props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="p-4">
        Welcome to your dashboard {tenant ? ` - Tenant: ${tenant.id}` : ''}!
      </div>
    </AppLayout>
  )
}

import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { role } from '@/routes/admin/security/'
import { batchDelete, create } from '@/routes/admin/security/role'
import { paginated } from '@/routes/api/security/roles'
import { type BreadcrumbItem } from '@/types'
import { useRef } from 'react'
import { getColumns } from './columns'

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

const RoleIndex = () => {
  // Use ref to store refetch function from DataTable
  const refetchRef = useRef<(() => void) | null>(null)

  // Configurar columnas con refetch y opciones de acciones
  const columnsOptions = {
    onActionSuccess: () => {
      // Call refetch from DataTable when action succeeds
      refetchRef.current?.()
    },
    actionsConfig: {
      canEdit: true,
      canDelete: true,
    },
    batchDelete: {
      enabled: true,
      deleteUrl: batchDelete().url,
    },
  }

  const columns = getColumns(columnsOptions)

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable
        apiUrl={paginated().url}
        columns={columns}
        columnsOptions={columnsOptions}
        header={headerActions}
        onRefetch={(refetch) => {
          // Store refetch function for use in column actions
          refetchRef.current = refetch
        }}
      />
    </AppLayout>
  )
}

export default RoleIndex

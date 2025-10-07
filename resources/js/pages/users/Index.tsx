import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { getColumns } from '@/pages/users/columns'
import { users } from '@/routes'
import { paginated } from '@/routes/api/users'
import { batchDelete, create } from '@/routes/users'
import { type BreadcrumbItem } from '@/types'
import { useRef } from 'react'

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

const UsersIndex = () => {
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

export default UsersIndex

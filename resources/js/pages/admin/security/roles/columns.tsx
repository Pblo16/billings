'use client'

import { TableAction, TableActions } from '@/components/table-actions'
import { destroy, edit } from '@/routes/admin/security/role'
import { GetColumnsOptions, Role } from '@/types'
import { ColumnDef } from '@tanstack/react-table'

export const ActionsCell = ({
  data,
  onActionSuccess,
  actionsConfig = {},
}: {
  data: number
  onActionSuccess?: () => void
  actionsConfig?: {
    canEdit?: boolean
    canDelete?: boolean
  }
}) => {
  const { canEdit = true, canDelete = true } = actionsConfig

  const actions: TableAction[] = [
    {
      label: 'Edit user',
      href: edit(data).url,
      enabled: canEdit,
      variant: 'default',
    },
    {
      label: 'Delete user',
      enabled: canDelete,
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationQuery: destroy(data).url,
    },
  ]

  return <TableActions actions={actions} onActionSuccess={onActionSuccess} />
}

export const getColumns = (
  options?: GetColumnsOptions,
): ColumnDef<Role, unknown>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const data = row.original
      return (
        <ActionsCell
          data={data.id}
          onActionSuccess={options?.onActionSuccess}
          actionsConfig={options?.actionsConfig}
        />
      )
    },
  },
]

'use client'

import { TableAction, TableActions } from '@/components/table-actions'
import { destroy, edit } from '@/routes/users'
import { GetColumnsOptions, Posts } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
export const ActionsCell = ({
  id,
  onActionSuccess,
  actionsConfig = {},
}: {
  id: number
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
      href: edit(id).url,
      enabled: canEdit,
      variant: 'default',
    },
    {
      label: 'Delete user',
      enabled: canDelete,
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationQuery: destroy(id).url,
    },
  ]

  return <TableActions actions={actions} onActionSuccess={onActionSuccess} />
}

export const getColumns = (
  options?: GetColumnsOptions,
): ColumnDef<Posts, any>[] => [
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
      const item = row.original
      return (
        <ActionsCell
          id={item.id}
          onActionSuccess={options?.onActionSuccess}
          actionsConfig={options?.actionsConfig}
        />
      )
    },
  },
]

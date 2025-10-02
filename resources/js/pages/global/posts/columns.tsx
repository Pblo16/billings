'use client'

import { TableAction, TableActions } from '@/components/table-actions'
import { destroy, edit } from '@/routes/global/posts'
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
      label: 'Edit Posts',
      href: edit(id).url,
      enabled: canEdit,
      variant: 'default',
    },
    {
      label: 'Delete Posts',
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
    accessorKey: 'colaborator',
    header: 'Colaborator',
    cell: ({ row }) => {
      const colaborator = row.original.colaborator

      // If colaborator is a User object (relationship loaded), show the name
      if (typeof colaborator === 'object' && colaborator?.name) {
        return <span>{colaborator.name}</span>
      }

      // If colaborator is just an ID or null/undefined, show appropriate message
      return (
        <span>{colaborator ? `ID: ${colaborator}` : 'No colaborator'}</span>
      )
    },
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
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

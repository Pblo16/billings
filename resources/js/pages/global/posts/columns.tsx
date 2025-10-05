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

  return (
    <TableActions
      actions={actions}
      onActionSuccess={() => {
        // This will be called after a successful delete
        onActionSuccess?.()
      }}
    />
  )
}

export const getColumns = (
  options?: GetColumnsOptions,
): ColumnDef<Posts, unknown>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'user_id',
    header: 'Author',
    cell: ({ row }) => {
      const user = row.original.user?.name
      // If user is just an ID or null/undefined, show appropriate message
      console.log('User data in row:', user)
      if (!user) {
        return <span>No user</span>
      }
      return <span>{user}</span>
    },
  },
  {
    header: 'Colaborators',
    cell: ({ row }) => {
      const colaborator = row.original.details
      // If colaborator is just an ID or null/undefined, show appropriate message

      return (
        <span>
          {colaborator
            ? colaborator?.map((colab) => {
                return (
                  <div key={colab.colaborator.id}>{colab.colaborator.name}</div>
                )
              })
            : 'No colaborator'}
        </span>
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

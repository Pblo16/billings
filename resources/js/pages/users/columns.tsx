'use client'

import { TableAction, TableActions } from '@/components/table-actions'
import { destroy, edit } from '@/routes/users'
import { GetColumnsOptions, UserWithAvatar } from '@/types'
import { ColumnDef } from '@tanstack/react-table'

function getInitials(nameOrEmail: string | null | undefined) {
  const base = (nameOrEmail ?? '').trim()
  if (!base) return 'NA'
  const parts = base.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return base.slice(0, 2).toUpperCase()
  const [a, b] = [parts[0]?.[0], parts[1]?.[0]]
  return `${a ?? ''}${b ?? ''}`.toUpperCase() || base.slice(0, 2).toUpperCase()
}

// Actions cell component that can use hooks - exported for use in Index
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
): ColumnDef<UserWithAvatar, unknown>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'email_verified_at',
    header: 'Email Verified',
    cell: ({ row }) => {
      const verified = row.getValue('email_verified_at')
      return verified ? 'Yes' : 'No'
    },
  },
  {
    id: 'avatar',
    header: 'Avatar',
    cell: ({ row }) => {
      const user = row.original
      const src = user.avatar ?? undefined
      const displayName = user.name ?? user.email
      if (src) {
        return (
          <img
            src={src}
            alt={displayName}
            className="rounded-full w-8 h-8 object-cover"
          />
        )
      }
      const initials = getInitials(displayName)
      return (
        <div className="flex justify-center items-center bg-neutral-200 dark:bg-neutral-700 rounded-full w-8 h-8 font-medium text-neutral-700 dark:text-white text-xs">
          {initials}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original
      return (
        <ActionsCell
          id={user.id}
          onActionSuccess={options?.onActionSuccess}
          actionsConfig={options?.actionsConfig}
        />
      )
    },
  },
]

// Backward compatibility: export columns with default config
export const columns = getColumns()

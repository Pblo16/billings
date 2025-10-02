'use client'

import AppActionAlert from '@/components/app-action-alert'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { edit, show } from '@/routes/users'
import { UserWithAvatar } from '@/types'
import { Link } from '@inertiajs/react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

function getInitials(nameOrEmail: string | null | undefined) {
  const base = (nameOrEmail ?? '').trim()
  if (!base) return 'NA'
  const parts = base.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return base.slice(0, 2).toUpperCase()
  const [a, b] = [parts[0]?.[0], parts[1]?.[0]]
  return `${a ?? ''}${b ?? ''}`.toUpperCase() || base.slice(0, 2).toUpperCase()
}

// Actions cell component that can use hooks - exported for use in Index
export const UserActionsCell = ({
  user,
  onDelete,
}: {
  user: UserWithAvatar
  onDelete?: () => void
}) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const [query, setQuery] = useState(null as string | null)

  return (
    <>
      <DropdownMenu open={openMenu} onOpenChange={setOpenMenu}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="p-0 w-8 h-8">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>
            <Link href={edit(user.id)} className="w-full">
              Edit user
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              setOpenMenu(false)
              setOpenDialog(true)
              setQuery(show(user.id).url)
            }}
          >
            Delete user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AppActionAlert
        query={query}
        open={openDialog}
        setOpen={setOpenDialog}
        onSuccess={onDelete}
      />
    </>
  )
}

export const columns: ColumnDef<UserWithAvatar, unknown>[] = [
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
      return <UserActionsCell user={user} />
    },
  },
]

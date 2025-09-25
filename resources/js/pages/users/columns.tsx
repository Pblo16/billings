'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User } from '@/types'
import { router } from '@inertiajs/react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'

type UserWithAvatar = User & { avatar?: string | null }

function getInitials(nameOrEmail: string | null | undefined) {
  const base = (nameOrEmail ?? '').trim()
  if (!base) return 'NA'
  const parts = base.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return base.slice(0, 2).toUpperCase()
  const [a, b] = [parts[0]?.[0], parts[1]?.[0]]
  return `${a ?? ''}${b ?? ''}`.toUpperCase() || base.slice(0, 2).toUpperCase()
}

export const columns: ColumnDef<UserWithAvatar>[] = [
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
      const user = row.original as UserWithAvatar
      const src = user.avatar ?? undefined
      const displayName = user.name ?? user.email
      if (src) {
        return (
          <img
            src={src}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover"
          />
        )
      }
      const initials = getInitials(displayName)
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-white">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(String(user.name))}
            >
              Copy user name
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.get(`/bills/${user.id}/edit`)}
            >
              Edit user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

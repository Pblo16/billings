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
import { useState } from 'react'

import AppActionAlert from '@/components/app-action-alert'
import Copy from '@/components/ui/copy'
import { destroy, edit } from '@/routes/control/clients'
import { type Clients } from '@/types'
import { Link } from '@inertiajs/react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'

export const columns: ColumnDef<Clients, any>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string | null

      // Format phone as (###) ###-####
      const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '')
        if (digits.length === 10) {
          return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
        }
        return value
      }

      return phone ? (
        <div>
          <span className="font-mono">{formatPhone(phone)}</span>
          <Copy data={phone} />
        </div>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const item = row.original
      const [openDialog, setOpenDialog] = useState(false)
      const [openMenu, setOpenMenu] = useState(false)
      const [query, setQuery] = useState<string | null>(null)

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
                <Link href={edit(item.id)} className="w-full">
                  Edit Clients
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setOpenMenu(false)
                  setOpenDialog(true)
                  setQuery(destroy(item.id).url)
                }}
              >
                Delete Clients
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AppActionAlert
            query={query}
            open={openDialog}
            setOpen={setOpenDialog}
          />
        </>
      )
    },
  },
]

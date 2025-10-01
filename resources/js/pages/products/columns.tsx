'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { destroy, edit } from '@/routes/products'
import { type Product } from '@/types'
import { Link } from '@inertiajs/react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import AppActionAlert from '@/components/app-action-alert'

export const columns: ColumnDef<Product, any>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = row.getValue('price')
      return price !== null && price !== undefined ? `$ ${price}` : 'N/A'
    },
  },
  {
    header: 'Actions',
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
                  Edit Product
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
                Delete Product
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

'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Link } from '@inertiajs/react'
import { Button } from './ui/button'
import { useState } from 'react'
// Define a custom type for header actions
interface HeaderAction {
  label: string
  href: string
  variant?: 'default' | 'outline' | 'secondary'
}

interface ConfirmDialogProps {
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  route?: string
  header?: HeaderAction[]
  onDelete?: (row: TData) => void
  confirmDialogProps?: ConfirmDialogProps
}

import { UserWithAvatar } from '@/types'

export function DataTable({
  columns,
  data,
  route,
  header,
  onDelete,
  confirmDialogProps,
}: DataTableProps<UserWithAvatar, any>) {
  // Dialog state
  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<UserWithAvatar | null>(null)

  // Handler to trigger dialog from child
  const handleRequestDelete = (row: UserWithAvatar) => {
    setSelectedRow(row)
    setOpen(true)
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      requestDelete: handleRequestDelete,
    },
  })

  // Default dialog props
  const {
    title = 'Confirm Deletion',
    description = 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
  } = confirmDialogProps || {}

  // Handler for confirming delete
  const handleConfirmDelete = () => {
    if (selectedRow && onDelete) {
      onDelete(selectedRow)
    }
    setOpen(false)
    setSelectedRow(null)
  }

  // Handler for cancel
  const handleCancel = () => {
    setOpen(false)
    setSelectedRow(null)
  }

  // Pass handleRequestDelete to columns via context
  // You can use a custom cell renderer in your columns to call handleRequestDelete(row.original)

  return (
    <div className="border rounded-md overflow-hidden">
      <header className="flex justify-between items-center p-4 border-b">
        <h2 className="font-medium text-lg">Data Table</h2>
        {header && header.length > 0 && (
          <div className="flex gap-2">
            {header.map((action, idx) => (
              <Button asChild key={idx} variant={action.variant || 'default'}>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        )}
      </header>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, {
                      ...cell.getContext(),
                      requestDelete: () => handleRequestDelete(row.original),
                    })}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* General AlertDialog for delete confirmation */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white"
            >
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

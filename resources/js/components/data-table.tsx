'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Link } from '@inertiajs/react'
import { useState } from 'react'
import { Button } from './ui/button'

// Define a custom type for header actions
interface HeaderAction {
  label: string
  href: string
  variant?: 'default' | 'outline' | 'secondary'
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  route?: string
  header?: HeaderAction[]
}

export function DataTable<TData, TValue>({
  columns,
  data = [],
  header,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  const [page, setPage] = useState(1)

  return (
    <div className="flex flex-col justify-between p-12 border-2 rounded-md h-full">
      <header className="flex justify-between items-center p-2 border-b">
        <h2 className="font-medium text-lg">Data Table</h2>
        {header && header.length > 0 && (
          <div className="flex gap-2">
            {header.map((action, idx) => (
              <Button asChild key={idx} variant={action.variant || 'secondary'}>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        )}
      </header>
      <Table className="flex-1 overflow-auto">
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
        <TableBody className="">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
      <footer className="p-2 border-t text-muted-foreground text-sm">
        {table.getRowModel().rows.length} results.
      </footer>
    </div>
  )
}

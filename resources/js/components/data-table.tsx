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
  children?: React.ReactNode
  loading?: boolean | undefined
  error?: Error | null
  paginator?: React.ReactNode
  count?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data = [],
  header,
  children,
  loading,
  error,
  paginator,
  count,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-col justify-between p-8 border-2 rounded-md h-full">
      <header className="flex justify-between items-center py-2 border-b">
        {count && count}
        <div className="flex items-center gap-4">
          {paginator && paginator}
          {header && header.length > 0 && (
            <div className="flex self-end gap-2">
              {header.map((action, idx) => (
                <Button
                  asChild
                  key={idx}
                  variant={action.variant || 'secondary'}
                >
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
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
        {loading && (
          <div className="p-4 text-muted-foreground text-sm text-center">
            Loading...
          </div>
        )}
        {error && (
          <div className="p-4 text-destructive text-sm text-center">
            Error: {error.message}
          </div>
        )}
        {data.length > 0 && !loading && !error && (
          <TableBody className="">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        )}
      </Table>
      {children}
    </div>
  )
}

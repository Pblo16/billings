'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useFetch from '@/hooks/use-fetch'
import { PaginatedResponse } from '@/types'
import { Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import AppPaginator from './app-paginator'
import { Button } from './ui/button'

// Define a custom type for header actions
interface HeaderAction {
  label: string
  href: string
  variant?: 'default' | 'outline' | 'secondary'
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  // Either provide apiUrl for automatic fetching, or data directly
  apiUrl?: string
  data?: PaginatedResponse<TData> | TData[] | null
  header?: HeaderAction[]
  children?: React.ReactNode
  // Optional external control (if not using apiUrl)
  loading?: boolean | undefined
  error?: Error | null
  onPageChange?: (page: number) => void
  perPage?: string
  setPerPage?: (perPage: string) => void
  page?: number
  setPage?: (page: number) => void
  // Expose refetch function for actions (like delete, update)
  onRefetch?: (refetch: () => void) => void
}

export function DataTable<TData, TValue>({
  columns,
  apiUrl,
  data: externalData = null,
  header,
  loading: externalLoading,
  error: externalError,
  onPageChange: externalOnPageChange,
  perPage: externalPerPage,
  setPerPage: externalSetPerPage,
  page: externalPage,
  setPage: externalSetPage,
  onRefetch,
}: DataTableProps<TData, TValue>) {
  // Internal state for pagination (used when apiUrl is provided)
  const [internalPage, setInternalPage] = useState(1)
  const [internalPerPage, setInternalPerPage] = useState('10')

  // Determine which state to use
  const page = apiUrl ? internalPage : (externalPage ?? 1)
  const perPage = apiUrl ? internalPerPage : (externalPerPage ?? '10')
  const setPageFn = apiUrl ? setInternalPage : externalSetPage
  const setPerPageFn = apiUrl ? setInternalPerPage : externalSetPerPage

  // Fetch data if apiUrl is provided
  const fetchUrl = apiUrl ? `${apiUrl}?page=${page}&perPage=${perPage}` : ''
  const fetchResult = useFetch<PaginatedResponse<TData>>(fetchUrl)

  // Expose refetch to parent if callback provided
  useEffect(() => {
    if (onRefetch && apiUrl && fetchResult.refetch) {
      onRefetch(fetchResult.refetch)
    }
  }, [onRefetch, apiUrl, fetchResult.refetch])

  // Determine final data, loading, and error states
  const data = apiUrl ? fetchResult.data : externalData
  const loading = apiUrl ? fetchResult.loading : externalLoading
  const error = apiUrl ? fetchResult.error : externalError

  // Normalize data: rows for the table and paginated metadata if present
  const isArrayData = Array.isArray(data)
  const paginated =
    !isArrayData && data ? (data as PaginatedResponse<TData>) : null
  const rowsData: TData[] = isArrayData
    ? (data as TData[])
    : (paginated?.data ?? [])

  const table = useReactTable({
    data: rowsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (apiUrl) {
      setInternalPage(newPage)
    } else if (externalOnPageChange) {
      externalOnPageChange(newPage)
    }
  }

  return (
    <div className="flex flex-col px-4 pt-4 rounded-md w-full h-full">
      <header className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4 border-b">
        {/* Left section: Per page selector and count */}
        <div className="flex sm:flex-row flex-col sm:items-center gap-3 sm:gap-4">
          {paginated && (
            <>
              <Select
                value={perPage}
                onValueChange={(value) => {
                  setPerPageFn?.(value)
                  setPageFn?.(1) // Reset to first page when changing items per page
                }}
              >
                <SelectTrigger className="w-full sm:w-[100px]">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-muted-foreground text-xs whitespace-nowrap">
                Showing {paginated.from ?? 0} to {paginated.to ?? 0} of{' '}
                {paginated.total} results
              </div>
            </>
          )}
        </div>

        {/* Right section: Pagination and actions */}
        <div className="flex sm:flex-row flex-col sm:items-center gap-3 sm:gap-4">
          {paginated && (
            <AppPaginator
              currentPage={paginated.current_page}
              lastPage={paginated.last_page}
              onPageChange={handlePageChange}
            />
          )}
          {header && header.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {header.map((action, idx) => (
                <Button
                  asChild
                  key={idx}
                  variant={action.variant || 'secondary'}
                  className="flex-1 sm:flex-none"
                >
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </header>
      {loading && (
        <div className="p-6 text-muted-foreground text-sm text-center">
          Loading...
        </div>
      )}
      {error && (
        <div className="p-6 text-destructive text-sm text-center">
          Error: {error.message}
        </div>
      )}
      {rowsData.length >= 0 && !loading && !error && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="whitespace-nowrap">
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
                      <TableCell key={cell.id} className="whitespace-nowrap">
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
          </Table>
        </div>
      )}
    </div>
  )
}

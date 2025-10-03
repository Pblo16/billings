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
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import AppPaginator from './app-paginator'
import { Button } from './ui/button'
import { InputWithIcon } from './ui/input-incon'

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
  const [sortBy, setSortBy] = useState('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [search, setSearch] = useState('')
  // Determine which state to use
  const page = apiUrl ? internalPage : (externalPage ?? 1)
  const perPage = apiUrl ? internalPerPage : (externalPerPage ?? '10')
  const setPageFn = useCallback(
    (newPage: number) => {
      if (apiUrl) {
        setInternalPage(newPage)
      } else if (externalSetPage) {
        externalSetPage(newPage)
      }
    },
    [apiUrl, externalSetPage],
  )

  const setPerPageFn = useCallback(
    (newPerPage: string) => {
      if (apiUrl) {
        setInternalPerPage(newPerPage)
      } else if (externalSetPerPage) {
        externalSetPerPage(newPerPage)
      }
    },
    [apiUrl, externalSetPerPage],
  )
  // Fetch data if apiUrl is provided
  const fetchUrl = apiUrl
    ? `${apiUrl}?page=${page}&perPage=${perPage}&sortBy=${sortBy}&sortDirection=${sortDirection}&search=${encodeURIComponent(search)}`
    : ''
  const fetchResult = useFetch<PaginatedResponse<TData>>(fetchUrl)

  // Expose refetch to parent if callback provided (only once on mount)
  useEffect(() => {
    if (onRefetch && apiUrl && fetchResult.refetch) {
      onRefetch(fetchResult.refetch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRefetch, apiUrl])

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
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (apiUrl) {
        setInternalPage(newPage)
      } else if (externalOnPageChange) {
        externalOnPageChange(newPage)
      }
    },
    [apiUrl, externalOnPageChange],
  )

  // Handle search change
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      setPageFn(1) // Reset to first page on search
    },
    [setPageFn],
  )

  return (
    <div className="flex flex-col px-4 pt-4 rounded-md w-full h-full">
      <header className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4 mb-2 pb-4 border-b">
        {/* Left section: Per page selector and count */}
        <div className="flex sm:flex-row flex-col sm:items-center gap-3 sm:gap-4">
          {loading && !paginated ? (
            <>
              <div className="bg-muted rounded-md w-full sm:w-[100px] h-10 animate-pulse" />
              <div className="bg-muted rounded w-48 h-4 animate-pulse" />
            </>
          ) : paginated ? (
            <>
              <Select
                value={perPage}
                onValueChange={(value) => {
                  setPerPageFn(value)
                  setPageFn(1) // Reset to first page when changing items per page
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
          ) : null}
        </div>
        <div className="flex-1">
          <InputWithIcon
            suffix={Search}
            debounce={500}
            placeholder="Search..."
            clear
            onDebouncedChange={handleSearchChange}
          />
        </div>
        {/* Right section: Pagination and actions */}
        <div className="flex sm:flex-row flex-col sm:items-center gap-3 sm:gap-4">
          {loading && !paginated ? (
            <div className="bg-muted rounded-md w-64 h-10 animate-pulse" />
          ) : paginated ? (
            <AppPaginator
              currentPage={paginated.current_page}
              lastPage={paginated.last_page}
              onPageChange={handlePageChange}
            />
          ) : null}
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
                      {header.column.getCanSort() ? (
                        <button
                          onClick={() => {
                            const isAsc =
                              sortBy === (header.column.id as string) &&
                              sortDirection === 'asc'
                            const newDirection = isAsc ? 'desc' : 'asc'
                            setSortBy(header.column.id as string)
                            setSortDirection(newDirection)
                            // If using external pagination, notify parent of page change
                            if (!apiUrl && externalOnPageChange) {
                              externalOnPageChange(1) // Reset to first page on sort change
                            }
                          }}
                          className="ml-2"
                        >
                          {sortBy === header.column.id ? (
                            sortDirection === 'desc' ? (
                              <ChevronUp className="inline-block w-4 h-4 rotate-180" />
                            ) : (
                              <ChevronDown className="inline-block w-4 h-4 rotate-180" />
                            )
                          ) : (
                            <ChevronUp className="inline-block w-4 h-4 rotate-180" />
                          )}
                        </button>
                      ) : null}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-muted-foreground text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-destructive text-center"
                >
                  Error: {error.message}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
    </div>
  )
}

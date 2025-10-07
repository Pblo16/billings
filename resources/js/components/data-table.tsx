'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
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
import { GetColumnsOptions, PaginatedResponse } from '@/types'
import { Link, router } from '@inertiajs/react'
import { ChevronDown, ChevronUp, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import AppActionAlert from './app-action-alert'
import AppPaginator from './app-paginator'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
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
  setPage?: (page: number) => void
  // Expose refetch function for actions (like delete, update)
  onRefetch?: (refetch: () => void) => void
  // Batch delete configuration (optional - can be extracted from columns metadata)
  batchDeleteConfig?: GetColumnsOptions['batchDelete']
  // Column options (used to extract batch delete config if not provided directly)
  columnsOptions?: GetColumnsOptions
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
  setPage: externalSetPage,
  onRefetch,
  batchDeleteConfig: externalBatchDeleteConfig,
  columnsOptions,
}: DataTableProps<TData, TValue>) {
  // Use batchDeleteConfig from props, or extract from columnsOptions
  const batchDeleteConfig =
    externalBatchDeleteConfig ?? columnsOptions?.batchDelete
  // Internal state for pagination and fetching
  const [internalPage, setInternalPage] = useState(1)
  const [internalPerPage, setInternalPerPage] = useState('10')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  // State for local sorting (no server fetch)
  const [sorting, setSorting] = useState<SortingState>([])
  // State for row selection (batch operations)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  // State for batch delete confirmation dialog
  const [showBatchDeleteAlert, setShowBatchDeleteAlert] = useState(false)
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([])

  // Build fetch URL with params (only if using apiUrl)
  const buildFetchUrl = useCallback(() => {
    if (!apiUrl) return ''
    return `${apiUrl}?page=${internalPage}&perPage=${internalPerPage}&search=${encodeURIComponent(debouncedSearch)}`
  }, [apiUrl, internalPage, internalPerPage, debouncedSearch])

  // Use fetch hook without caching
  const {
    data: fetchedData,
    loading: fetchLoading,
    error: fetchError,
    refetch: fetchRefetch,
  } = useFetch<PaginatedResponse<TData>>(buildFetchUrl())

  // Determine which state to use
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
        setInternalPage(1) // Reset to first page when changing items per page
      } else if (externalSetPerPage) {
        externalSetPerPage(newPerPage)
      }
    },
    [apiUrl, externalSetPerPage],
  )

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPageFn(1) // Reset to first page on search
    }, 500)

    return () => clearTimeout(timer)
  }, [search, setPageFn])

  // Expose refetch to parent
  useEffect(() => {
    if (onRefetch && apiUrl) {
      // When parent calls refetch, force refresh without cache
      onRefetch(() => {
        fetchRefetch()
      })
    }
  }, [onRefetch, apiUrl, fetchRefetch])

  // Determine final data state
  const finalData = apiUrl ? fetchedData : externalData
  const finalLoading = apiUrl ? fetchLoading : externalLoading
  const finalError = apiUrl ? fetchError : externalError

  // Normalize data: rows for the table and paginated metadata if present
  const isArrayData = Array.isArray(finalData)
  const paginated =
    !isArrayData && finalData ? (finalData as PaginatedResponse<TData>) : null
  const rowsData: TData[] = isArrayData
    ? (finalData as TData[])
    : (paginated?.data ?? [])

  // Add selection column if batch delete is enabled
  const columnsWithSelection: ColumnDef<TData, TValue>[] =
    batchDeleteConfig?.enabled
      ? [
          {
            id: 'select',
            header: ({ table }) => (
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40, // Fixed width for checkbox column
            minSize: 40,
            maxSize: 40,
          } as ColumnDef<TData, TValue>,
          ...columns,
        ]
      : columns

  // Setup table with local sorting and row selection
  const table = useReactTable({
    data: rowsData,
    columns: columnsWithSelection,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Enable sorting toggle without clearing (always asc <-> desc)
    enableSortingRemoval: false,
    getRowId: (row: TData) => String((row as any).id), // Assume rows have an 'id' field
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
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])

  // Handle batch delete - show confirmation dialog
  const handleBatchDeleteClick = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedIds = selectedRows.map((row) => (row.original as any).id)

    if (selectedIds.length === 0) return

    setPendingDeleteIds(selectedIds)
    setShowBatchDeleteAlert(true)
  }, [table])

  // Execute batch delete after confirmation
  const executeBatchDelete = useCallback(() => {
    if (pendingDeleteIds.length === 0) return

    if (batchDeleteConfig?.onDelete) {
      // Use custom handler
      batchDeleteConfig.onDelete(pendingDeleteIds)
      setRowSelection({})
      fetchRefetch()
    } else if (batchDeleteConfig?.deleteUrl) {
      // Use Inertia to send DELETE request
      router.delete(batchDeleteConfig.deleteUrl, {
        data: { ids: pendingDeleteIds },
        preserveScroll: true,
        onSuccess: () => {
          setRowSelection({})
          setPendingDeleteIds([])
          fetchRefetch()
        },
        onError: (errors) => {
          console.error('Batch delete failed:', errors)
        },
      })
    }
  }, [pendingDeleteIds, batchDeleteConfig, fetchRefetch])

  // Get count of selected rows
  const selectedCount = Object.keys(rowSelection).length

  return (
    <>
      {/* Batch delete confirmation dialog */}
      <AppActionAlert
        query={null}
        open={showBatchDeleteAlert}
        setOpen={(open) => {
          setShowBatchDeleteAlert(open)
          if (!open) {
            setPendingDeleteIds([])
          }
        }}
        onSuccess={executeBatchDelete}
        title="Delete multiple items?"
        description={`Are you sure you want to delete ${pendingDeleteIds.length} item(s)? This action cannot be undone and will permanently remove the selected data from the servers.`}
      />

      <div className="flex flex-col px-4 pt-4 rounded-md w-full h-full">
        <header className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4 mb-2 pb-4 border-b">
          {/* Batch delete button (shown when rows are selected) */}
          {batchDeleteConfig?.enabled && selectedCount > 0 && (
            <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md">
              <span className="font-medium text-sm">
                {selectedCount} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDeleteClick}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </Button>
            </div>
          )}
          {/* Left section: Per page selector and count */}
          <div className="flex sm:flex-row flex-col sm:items-center gap-3 sm:gap-4">
            {finalLoading && !paginated ? (
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
            {finalLoading && !paginated ? (
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
                    const isSorted = header.column.getIsSorted()
                    const isSelectColumn = header.column.id === 'select'
                    return (
                      <TableHead
                        key={header.id}
                        className="whitespace-nowrap"
                        style={
                          isSelectColumn
                            ? {
                                width: '40px',
                                minWidth: '40px',
                                maxWidth: '40px',
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-center">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                          {header.column.getCanSort() && (
                            <button
                              onClick={header.column.getToggleSortingHandler()}
                              className="hover:opacity-70 ml-2 transition-opacity"
                            >
                              {isSorted === 'desc' ? (
                                <ChevronDown className="inline-block w-4 h-4" />
                              ) : isSorted === 'asc' ? (
                                <ChevronUp className="inline-block w-4 h-4" />
                              ) : (
                                <ChevronUp className="inline-block opacity-30 w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {finalLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-muted-foreground text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : finalError ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-destructive text-center"
                  >
                    Error: {finalError.message}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isSelectColumn = cell.column.id === 'select'
                      return (
                        <TableCell
                          key={cell.id}
                          className="whitespace-nowrap"
                          style={
                            isSelectColumn
                              ? {
                                  width: '40px',
                                  minWidth: '40px',
                                  maxWidth: '40px',
                                }
                              : undefined
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      )
                    })}
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
    </>
  )
}

import AppPaginator from '@/components/app-paginator'
import { DataTable } from '@/components/data-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useFetch from '@/hooks/use-fetch'
import AppLayout from '@/layouts/app-layout'
import { columns, UserActionsCell } from '@/pages/users/columns'
import { users } from '@/routes'
import { paginated } from '@/routes/api/users'
import { create } from '@/routes/users'
import { type BreadcrumbItem, type User } from '@/types'
import { useState } from 'react'
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Users',
    href: users().url,
  },
]

const headerActions = [
  {
    label: 'New User',
    href: create().url,
  },
]

interface PaginatedResponse {
  data: User[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  [key: string]: any // Para cualquier otro campo adicional que pueda venir en la respuesta
}

const UsersIndex = () => {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState('10')

  const { data, loading, error, refetch } = useFetch(
    `${paginated().url}?page=${page}&perPage=${perPage}`,
  )

  // Create columns with refetch callback
  const columnsWithActions = columns.map((col) => {
    if (col.id === 'actions') {
      return {
        ...col,
        cell: ({ row }: any) => {
          const user = row.original
          return <UserActionsCell user={user} onDelete={refetch} />
        },
      }
    }
    return col
  })

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable
        loading={loading}
        error={error}
        columns={columnsWithActions}
        data={data?.data ?? []}
        header={headerActions}
        paginator={
          data && (
            <AppPaginator
              currentPage={data.current_page}
              lastPage={data.last_page}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )
        }
        count={
          <Select
            value={perPage}
            onValueChange={(value) => {
              setPerPage(value)
              setPage(1) // Reset to first page when changing items per page
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        }
      ></DataTable>
    </AppLayout>
  )
}

export default UsersIndex

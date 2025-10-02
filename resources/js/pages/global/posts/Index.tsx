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
import { paginated } from '@/routes/api/global/post'
import { post } from '@/routes/global'
import { create } from '@/routes/global/post'
import { type BreadcrumbItem } from '@/types'
import { useState } from 'react'
import { columns } from './columns'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: '{{pluralName}}',
    href: post().url,
  },
]

const headerActions = [
  {
    label: 'New Post',
    href: create().url,
  },
]

const PostIndex = () => {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState('10')

  const { data, loading, error, refetch } = useFetch(
    `${paginated().url}?page=${page}&perPage=${perPage}`,
  )

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable
        loading={loading}
        error={error}
        columns={columns}
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

export default PostIndex

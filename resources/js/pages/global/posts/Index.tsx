import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/global/posts/columns'
import { create } from '@/routes/global/post'
import { type BreadcrumbItem, type Post } from '@/types'
import { post }  from '@/routes/global/'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Post',
    href: post().url,
  },
]

const headerActions = [
  {
    label: 'New Post',
    href: create().url,
    variant: 'outline' as const,
  },
]

const PostIndex = (props: { data: Post[] }) => {
  const { data } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable columns={columns} data={data ?? null} header={headerActions} />
    </AppLayout>
  )
}

export default PostIndex

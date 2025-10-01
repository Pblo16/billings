import { DataTable } from '@/components/data-table'
import AppLayout from '@/layouts/app-layout'
import { columns } from '@/pages/products/columns'
import { create } from '@/routes/products'
import { type BreadcrumbItem, type Product } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Product',
    href: '/products',
  },
]

const headerActions = [
  {
    label: 'New Product',
    href: create().url,
  },
]

const ProductIndex = (props: { data: Product[] }) => {
  const { data } = props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DataTable columns={columns} data={data} header={headerActions} />
    </AppLayout>
  )
}

export default ProductIndex

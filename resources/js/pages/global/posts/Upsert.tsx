import AppForm from '@/components/app-form'
import UpsertShell from '@/components/upsert-shell'
import { posts } from '@/routes/global/'
import { BreadcrumbItem, Posts } from '@/types'
import PostsForm from './PostsForm'

interface UpsertProps {
  data?: Posts
  mode?: 'create' | 'edit'
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Posts',
    href: posts().url,
  },
]

const Upsert = ({ data, mode = 'create' }: UpsertProps) => {
  const isEdit = mode === 'edit'

  const pageCrumbs: BreadcrumbItem[] = [
    ...breadcrumbs,
    { title: isEdit ? 'Edit' : 'Create', href: '' },
  ]

  return (
    <UpsertShell
      title={isEdit ? 'Edit Posts' : 'Create Posts'}
      breadcrumbs={pageCrumbs}
      mode={mode}
      data={data as unknown as Record<string, unknown>}
      childPropName="posts"
      submitButtonText={(edit) => (edit ? 'Update Posts' : 'Create Posts')}
    >
      <AppForm>
        <PostsForm isEdit={isEdit} data={data ?? null} />
      </AppForm>
    </UpsertShell>
  )
}

export default Upsert

import AppForm from '@/components/app-form'
import UpsertShell from '@/components/upsert-shell'
import { BreadcrumbItem } from '@/types'
import PostsForm from './PostsForm'
import { posts }  from '@/routes/global/'

interface UpsertProps {
  data?: any
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
      data={data}
      childPropName="posts"
      submitButtonText={(edit) =>
        edit ? 'Update Posts' : 'Create Posts'
      }
    >
      <AppForm>
        <PostsForm isEdit={isEdit} data={data} />
      </AppForm>
    </UpsertShell>
  )
}

export default Upsert

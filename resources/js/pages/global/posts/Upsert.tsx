import AppForm from '@/components/app-form'
import UpsertShell from '@/components/upsert-shell'
import { BreadcrumbItem } from '@/types'
import PostForm from './PostForm'
import { post }  from '@/routes/global/'

interface UpsertProps {
  data?: any
  mode?: 'create' | 'edit'
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Posts',
    href: post().url,
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
      title={isEdit ? 'Edit Post' : 'Create Post'}
      breadcrumbs={pageCrumbs}
      mode={mode}
      data={data}
      childPropName="post"
      submitButtonText={(edit) =>
        edit ? 'Update Post' : 'Create Post'
      }
    >
      <AppForm>
        <PostForm isEdit={isEdit} data={data} />
      </AppForm>
    </UpsertShell>
  )
}

export default Upsert

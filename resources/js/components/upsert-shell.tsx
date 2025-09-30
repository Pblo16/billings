import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types'
import React from 'react'

interface UpsertShellProps {
  title?: string
  breadcrumbs?: BreadcrumbItem[]
  mode?: 'create' | 'edit'
  data?: any
  children: React.ReactNode
  childPropName?: string // prop name to pass the data under, default 'data'
  submitButtonText?: (isEdit: boolean) => string
}

const UpsertShell = ({
  title,
  breadcrumbs = [],
  mode = 'create',
  data,
  children,
  childPropName = 'data',
  submitButtonText,
}: UpsertShellProps) => {
  const isEdit = mode === 'edit'
  const computedTitle = title ?? (isEdit ? 'Edit' : 'Create')
  const computedSubmit = submitButtonText
    ? submitButtonText(isEdit)
    : isEdit
      ? 'Update'
      : 'Create'

  // Clone the child and inject props: isEdit, submitButtonText, and data under childPropName
  const injectedProps: Record<string, any> = {
    isEdit,
    submitButtonText: computedSubmit,
  }
  injectedProps[childPropName] = data

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <h1>{computedTitle}</h1>
      {children}
    </AppLayout>
  )
}

export default UpsertShell

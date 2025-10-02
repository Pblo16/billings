import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types'
import React from 'react'
import AppForm from './app-form'

interface UpsertShellProps {
  title?: string
  breadcrumbs?: BreadcrumbItem[]
  mode?: 'create' | 'edit'
  data?: Record<string, unknown>
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
  const injectedProps: Record<string, unknown> = {
    isEdit,
    submitButtonText: computedSubmit,
  }
  injectedProps[childPropName] = data

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <AppForm>
        <h1>{computedTitle}</h1>
        {children}
      </AppForm>
    </AppLayout>
  )
}

export default UpsertShell

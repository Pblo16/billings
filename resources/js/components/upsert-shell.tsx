import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types'
import React from 'react'
import AppForm from './app-form'

interface UpsertShellProps {
  breadcrumbs?: BreadcrumbItem[]
  mode?: 'create' | 'edit'
  data?: Record<string, unknown>
  children: React.ReactNode
  childPropName?: string // prop name to pass the data under, default 'data'
  submitButtonText?: (isEdit: boolean) => string
}

const UpsertShell = ({
  breadcrumbs = [],
  mode = 'create',
  data,
  children,
  childPropName = 'data',
  submitButtonText,
}: UpsertShellProps) => {
  const isEdit = mode === 'edit'
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
      <AppForm className="max-w-3xl">{children}</AppForm>
    </AppLayout>
  )
}

export default UpsertShell

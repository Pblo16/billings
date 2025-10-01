import { router } from '@inertiajs/react'

interface UseFormSubmitOptions<T extends Record<string, unknown> = Record<string, unknown>> {
  onSubmit?: (values: T) => void
  isEdit?: boolean
  entityId?: number | string
  entityPath: string // e.g., 'users', 'products', 'categories'
}

export const useFormSubmit = <T extends Record<string, unknown> = Record<string, unknown>>({
  onSubmit,
  isEdit = false,
  entityId,
  entityPath
}: UseFormSubmitOptions<T>) => {
  const handleSubmit = (values: T) => {
    if (onSubmit) {
      onSubmit(values)
    } else {
      // Default behavior
      if (isEdit && entityId) {
        router.put(`${entityPath}/${entityId}`, values as never)
      } else {
        router.post(`${entityPath}`, values as never)
      }
    }
  }

  return {
    handleSubmit,
  }
}
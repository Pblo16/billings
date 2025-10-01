import { router } from '@inertiajs/react'

interface UseFormSubmitOptions<T extends Record<string, any> = Record<string, any>> {
  onSubmit?: (values: T) => void
  isEdit?: boolean
  entityId?: number | string
  entityPath: string // e.g., 'users', 'products', 'categories'
}

export const useFormSubmit = <T extends Record<string, any> = Record<string, any>>({
  onSubmit,
  isEdit = false,
  entityId,
  entityPath
}: UseFormSubmitOptions<T>) => {
  console.log({ entityPath })
  const handleSubmit = (values: T) => {
    if (onSubmit) {
      onSubmit(values)
    } else {
      // Default behavior
      if (isEdit && entityId) {
        router.put(`/${entityPath}/${entityId}`, values as any)
      } else {
        router.post(`/${entityPath}`, values as any)
      }
    }
  }

  return {
    handleSubmit,
  }
}
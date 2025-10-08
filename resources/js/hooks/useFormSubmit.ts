import { router } from '@inertiajs/react'

interface UseFormSubmitOptions<T extends Record<string, unknown> = Record<string, unknown>> {
  onSubmit?: (values: T) => void
  isEdit?: boolean
  entityId?: number | string
  entityPath: string // e.g., 'users', 'products', 'categories'
}

/**
 * Detecta si los valores contienen archivos (File objects)
 */
const hasFileUpload = (values: Record<string, unknown>): boolean => {
  return Object.values(values).some(value => value instanceof File)
}

/**
 * Convierte los valores a FormData si contienen archivos
 */
const toFormData = (values: Record<string, unknown>): FormData => {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else if (Array.isArray(value)) {
      // Para arrays (como roles), agregar cada elemento
      value.forEach((item, index) => {
        formData.append(`${key}[${index}]`, String(item))
      })
    } else if (value !== null && value !== undefined && value !== '') {
      // No agregar campos de archivo que sean strings (paths de archivos existentes)
      // Solo agregamos el valor si no es un campo que típicamente contiene archivos
      // o si es un File object (ya manejado arriba)
      if (typeof value === 'string' && (key === 'cv' || key.endsWith('_file') || key.endsWith('_document'))) {
        // Omitir: es un path de archivo existente, no un archivo nuevo
        return
      }
      formData.append(key, String(value))
    }
  })

  return formData
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
      // Detectar si hay archivos y convertir a FormData
      const hasFiles = hasFileUpload(values)
      const data = hasFiles ? toFormData(values) : values

      // Default behavior
      if (isEdit && entityId) {
        // Para edición con archivos, usar POST con _method=PUT
        if (hasFiles) {
          const formData = data as FormData
          formData.append('_method', 'PUT')
          router.post(`${entityPath}/${entityId}`, formData as never)
        } else {
          router.put(`${entityPath}/${entityId}`, data as never)
        }
      } else {
        router.post(`${entityPath}`, data as never)
      }
    }
  }

  return {
    handleSubmit,
  }
}
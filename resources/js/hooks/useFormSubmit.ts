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
 * Lista de campos que típicamente contienen archivos
 */
const FILE_FIELD_PATTERNS = ['cv', 'avatar', 'image', 'file', 'document', 'attachment', 'photo']

/**
 * Verifica si un campo es un campo de archivo basado en su nombre
 */
const isFileField = (key: string): boolean => {
  const lowerKey = key.toLowerCase()
  return FILE_FIELD_PATTERNS.some(pattern =>
    lowerKey === pattern ||
    lowerKey.endsWith(`_${pattern}`) ||
    lowerKey.endsWith(`${pattern}s`)
  )
}

/**
 * Limpia los valores del formulario removiendo campos de archivo que no han cambiado
 * (son strings con URLs/paths en lugar de File objects)
 */
const cleanFormValues = (values: Record<string, unknown>): Record<string, unknown> => {
  const cleaned: Record<string, unknown> = {}

  Object.entries(values).forEach(([key, value]) => {
    // Si es un File object, siempre incluirlo
    if (value instanceof File) {
      cleaned[key] = value
    }
    // Si es un campo de archivo pero es string (URL existente), omitirlo
    else if (isFileField(key) && typeof value === 'string') {
      // No incluir: es una URL de archivo existente, no un archivo nuevo
      return
    }
    // Si es null en un campo de archivo, omitirlo también
    else if (isFileField(key) && value === null) {
      // No incluir: no hay archivo nuevo
      return
    }
    // Para todos los demás casos, incluir el valor si no es vacío
    else if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value
    }
  })

  return cleaned
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
      // Limpiar valores: remover campos de archivo que no han cambiado (strings con URLs)
      const cleanedValues = cleanFormValues(values)

      // Detectar si hay archivos y convertir a FormData
      const hasFiles = hasFileUpload(cleanedValues)
      const data = hasFiles ? toFormData(cleanedValues) : cleanedValues

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
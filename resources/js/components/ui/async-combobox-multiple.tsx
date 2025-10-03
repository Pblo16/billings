'use client'

import { CheckIcon, ChevronsUpDownIcon, Loader2Icon, XIcon } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface AsyncComboboxMultipleProps {
  value?: (string | number)[]
  onChange?: (value: (string | number)[]) => void
  readOnly?: boolean
  searchUrl?: string // URL del endpoint para buscar (opcional si se usan options)
  options?: { value: string; label: string }[] // Opciones manuales (sin búsqueda asíncrona)
  placeholder?: string
  emptyMessage?: string
  debounceMs?: number
  show?: number // Cantidad de resultados a mostrar en la paginación
}

export function AsyncComboboxMultiple({
  value: externalValue = [],
  onChange,
  readOnly = false,
  searchUrl,
  options: manualOptions,
  placeholder = 'Search options',
  emptyMessage = 'No option found.',
  debounceMs = 300,
  show = 10,
}: AsyncComboboxMultipleProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [options, setOptions] = React.useState<
    { value: string; label: string }[]
  >(manualOptions || [])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedOptionsCache, setSelectedOptionsCache] = React.useState<
    Map<string, string>
  >(new Map())

  // Determinar si usamos opciones manuales o búsqueda asíncrona
  const useAsyncSearch = !manualOptions && !!searchUrl

  // Convertir los valores externos a strings para la comparación
  const stringValues = React.useMemo(
    () => (externalValue || []).map((v) => v.toString()),
    [externalValue],
  )

  // Función para buscar en el servidor
  const fetchOptions = async (searchTerm: string) => {
    if (!searchUrl || !useAsyncSearch) return

    setLoading(true)
    setError(null)
    try {
      const url = new URL(searchUrl, window.location.origin)
      url.searchParams.append('search', searchTerm)
      url.searchParams.append('per_page', show.toString())
      url.searchParams.append('format', 'combobox') // Indicar formato para combobox

      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      // Validar que la respuesta sea un array
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array')
      }

      setOptions(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching options:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to load options',
      )
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  // Efecto para cargar opciones iniciales al abrir
  React.useEffect(() => {
    if (!useAsyncSearch || !open || search || loading) return

    // Cargar opciones iniciales solo una vez al abrir
    fetchOptions('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, useAsyncSearch, search])

  // Efecto para buscar cuando cambia el término de búsqueda con debounce
  React.useEffect(() => {
    if (!useAsyncSearch || !search) return

    const timeoutId = setTimeout(() => {
      fetchOptions(search)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, useAsyncSearch, debounceMs])

  // Resetear opciones al cerrar
  React.useEffect(() => {
    if (!useAsyncSearch) return

    if (!open) {
      setOptions([])
      setError(null)
    }
  }, [open, useAsyncSearch])

  // Inicializar el cache con los valores seleccionados de las opciones manuales
  React.useEffect(() => {
    if (manualOptions && manualOptions.length > 0) {
      const newCache = new Map<string, string>()
      stringValues.forEach((val) => {
        const found = manualOptions.find((opt) => opt.value === val)
        if (found) {
          newCache.set(found.value, found.label)
        }
      })
      setSelectedOptionsCache(newCache)
    }
  }, [stringValues, manualOptions])

  // Buscar los labels de los valores seleccionados si no están en el cache
  React.useEffect(() => {
    const fetchSelectedOptions = async () => {
      if (!useAsyncSearch || !searchUrl || stringValues.length === 0) {
        return
      }

      // Encontrar valores que no están en el cache
      const missingValues = stringValues.filter(
        (val) => !selectedOptionsCache.has(val),
      )

      if (missingValues.length === 0) return

      try {
        const url = new URL(searchUrl, window.location.origin)
        url.searchParams.append('ids', missingValues.join(','))
        url.searchParams.append('format', 'combobox')

        const response = await fetch(url.toString(), {
          headers: {
            Accept: 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Invalid response format: expected array')
        }

        const newCache = new Map(selectedOptionsCache)
        data.forEach((item: { value: string; label: string }) => {
          newCache.set(item.value, item.label)
        })
        setSelectedOptionsCache(newCache)
      } catch (error) {
        console.error('Error fetching selected options:', error)
      }
    }

    fetchSelectedOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringValues, useAsyncSearch])

  const handleSelect = (optionValue: string) => {
    if (readOnly) return

    const isSelected = stringValues.includes(optionValue)
    let newValues: (string | number)[]

    if (isSelected) {
      // Remover el valor
      newValues = stringValues.filter((v) => v !== optionValue)
    } else {
      // Agregar el valor
      newValues = [...stringValues, optionValue]

      // Cachear la opción seleccionada
      const option = options.find((opt) => opt.value === optionValue)
      if (option) {
        setSelectedOptionsCache((prev) => {
          const newCache = new Map(prev)
          newCache.set(option.value, option.label)
          return newCache
        })
      }
    }

    // Convertir a números si es posible
    const finalValues = newValues.map((val) => {
      const strVal = val.toString()
      return isNaN(Number(strVal)) ? strVal : Number(strVal)
    })

    onChange?.(finalValues)
  }

  const handleRemove = (valueToRemove: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (readOnly) return

    const newValues = stringValues
      .filter((v) => v !== valueToRemove)
      .map((val) => (isNaN(Number(val)) ? val : Number(val)))

    onChange?.(newValues)
  }

  return (
    <div className="space-y-2">
      {/* Combobox */}
      <Popover
        open={readOnly ? false : open}
        onOpenChange={readOnly ? undefined : setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            disabled={readOnly}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-readonly={readOnly ? 'true' : undefined}
            className={cn(
              'justify-between w-full',
              readOnly && 'cursor-not-allowed opacity-60',
            )}
            onClick={(e) => {
              if (readOnly) {
                e.preventDefault()
              }
            }}
          >
            {stringValues.length > 0
              ? `${stringValues.length} selected`
              : placeholder}
            <ChevronsUpDownIcon className="opacity-50 ml-2 w-4 h-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        {!readOnly && (
          <PopoverContent className="p-0 w-full">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={placeholder}
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                {loading && (
                  <React.Fragment key="loading">
                    <div className="flex justify-center items-center p-4">
                      <Loader2Icon className="w-5 h-5 animate-spin" />
                      <span className="ml-2 text-sm">Searching...</span>
                    </div>
                  </React.Fragment>
                )}
                {error && !loading && (
                  <React.Fragment key="error">
                    <div className="p-4 text-destructive text-sm text-center">
                      <p className="font-medium">Error loading options</p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        {error}
                      </p>
                    </div>
                  </React.Fragment>
                )}
                {!loading && !error && options.length === 0 && (
                  <React.Fragment key="empty">
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                  </React.Fragment>
                )}
                {!loading && !error && options.length > 0 && (
                  <React.Fragment key="options">
                    <CommandGroup>
                      {options.map(
                        (option: { value: string; label: string }) => {
                          const isSelected = stringValues.includes(option.value)
                          return (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              onSelect={() => handleSelect(option.value)}
                            >
                              <CheckIcon
                                className={cn(
                                  'mr-2 w-4 h-4',
                                  isSelected ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          )
                        },
                      )}
                    </CommandGroup>
                  </React.Fragment>
                )}
                {!search && !loading && !error && useAsyncSearch && (
                  <React.Fragment key="help-text">
                    <div className="p-2 border-t text-muted-foreground text-xs text-center">
                      Type to search...
                    </div>
                  </React.Fragment>
                )}
                {search && !loading && !error && useAsyncSearch && (
                  <React.Fragment key="results-count">
                    <div className="p-2 border-t text-muted-foreground text-xs text-center">
                      Showing {options.length} of up to {show} results
                    </div>
                  </React.Fragment>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
      {/* Selected items as badges */}
      {stringValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stringValues.map((val) => (
            <Badge key={val} variant="secondary" className="gap-1">
              {selectedOptionsCache.get(val) || val}
              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => handleRemove(val, e)}
                  className="hover:bg-muted ml-1 rounded-full"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

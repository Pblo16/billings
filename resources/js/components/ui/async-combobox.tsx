'use client'

import { CheckIcon, ChevronsUpDownIcon, Loader2Icon } from 'lucide-react'
import * as React from 'react'

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

interface AsyncComboboxProps {
  value?: string | number
  onChange?: (value: string | number) => void
  readOnly?: boolean
  searchUrl?: string // URL del endpoint para buscar (opcional si se usan options)
  options?: { value: string; label: string }[] // Opciones manuales (sin búsqueda asíncrona)
  placeholder?: string
  emptyMessage?: string
  debounceMs?: number
  show?: number // Cantidad de resultados a mostrar en la paginación
}

export function AsyncCombobox({
  value: externalValue,
  onChange,
  readOnly = false,
  searchUrl,
  options: manualOptions,
  placeholder = 'Search an option',
  emptyMessage = 'No option found.',
  debounceMs = 300,
  show = 10,
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [options, setOptions] = React.useState<
    { value: string; label: string }[]
  >(manualOptions || [])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedOptionCache, setSelectedOptionCache] = React.useState<{
    value: string
    label: string
  } | null>(null)

  // Determinar si usamos opciones manuales o búsqueda asíncrona
  const useAsyncSearch = !manualOptions && !!searchUrl

  // Convertir el valor externo a string para la comparación
  const stringValue =
    externalValue !== undefined && externalValue !== null
      ? externalValue.toString()
      : ''

  // Encontrar la opción seleccionada en las opciones actuales o en el cache
  const selectedOption =
    (Array.isArray(options) &&
      options.find((option) => option.value === stringValue)) ||
    (selectedOptionCache?.value === stringValue ? selectedOptionCache : null)

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
  }, [open, useAsyncSearch, search]) // No incluir fetchOptions para evitar ciclo

  // Efecto para buscar cuando cambia el término de búsqueda con debounce
  React.useEffect(() => {
    if (!useAsyncSearch || !search) return // Si usamos opciones manuales o no hay búsqueda, no hacer nada

    const timeoutId = setTimeout(() => {
      fetchOptions(search)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, useAsyncSearch, debounceMs]) // No incluir fetchOptions para evitar ciclo

  // Resetear opciones al cerrar
  React.useEffect(() => {
    if (!useAsyncSearch) return // Si usamos opciones manuales, no resetear

    if (!open) {
      setOptions([])
      setError(null)
    }
  }, [open, useAsyncSearch])

  // Inicializar el cache con el valor seleccionado de las opciones manuales
  React.useEffect(() => {
    if (
      stringValue &&
      manualOptions &&
      manualOptions.length > 0 &&
      !selectedOptionCache
    ) {
      const initialSelected = manualOptions.find(
        (opt: { value: string; label: string }) => opt.value === stringValue,
      )
      if (initialSelected) {
        setSelectedOptionCache(initialSelected)
      }
    }
  }, [stringValue, manualOptions, selectedOptionCache])

  // Buscar el label del valor seleccionado si no está en las opciones
  React.useEffect(() => {
    const fetchSelectedOption = async () => {
      // Solo buscar si:
      // 1. Usamos búsqueda asíncrona
      // 2. Hay un valor seleccionado
      // 3. No está en las opciones actuales
      // 4. No está en el cache
      // 5. Hay una URL de búsqueda
      if (!useAsyncSearch || !stringValue || !searchUrl || selectedOption) {
        return
      }

      try {
        const url = new URL(searchUrl, window.location.origin)
        url.searchParams.append('id', stringValue)
        url.searchParams.append('per_page', '1')
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

        if (data && data.length > 0) {
          const foundOption = data[0]
          setSelectedOptionCache(foundOption)
        }
      } catch (error) {
        console.error('Error fetching selected option:', error)
      }
    }

    fetchSelectedOption()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringValue, useAsyncSearch]) // Solo buscar cuando cambia el valor seleccionado

  return (
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
          {selectedOption?.label || placeholder}
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
                    {options.map((option: { value: string; label: string }) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => {
                          const newValue =
                            option.value === stringValue ? '' : option.value

                          // Cachear la opción seleccionada para mostrarla después
                          if (newValue !== '') {
                            setSelectedOptionCache(option)
                          } else {
                            setSelectedOptionCache(null)
                          }

                          // Intentar convertir a número si es posible y no está vacío
                          const finalValue =
                            newValue === '' || isNaN(Number(newValue))
                              ? newValue
                              : Number(newValue)
                          onChange?.(finalValue)
                          setSearch('') // Limpiar búsqueda al seleccionar
                          setOpen(false)
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 w-4 h-4',
                            stringValue === option.value
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
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
  )
}

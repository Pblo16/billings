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
  searchUrl: string // URL del endpoint para buscar
  initialOptions?: { value: string; label: string }[] // Opciones iniciales
  placeholder?: string
  emptyMessage?: string
  debounceMs?: number
}

export function AsyncCombobox({
  value: externalValue,
  onChange,
  readOnly = false,
  searchUrl,
  initialOptions = [],
  placeholder = 'Search an option',
  emptyMessage = 'No option found.',
  debounceMs = 300,
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [options, setOptions] = React.useState(initialOptions)
  const [loading, setLoading] = React.useState(false)
  const [selectedOptionCache, setSelectedOptionCache] = React.useState<{
    value: string
    label: string
  } | null>(null)

  // Convertir el valor externo a string para la comparación
  const stringValue =
    externalValue !== undefined && externalValue !== null
      ? externalValue.toString()
      : ''

  // Encontrar la opción seleccionada en las opciones actuales o en el cache
  const selectedOption =
    options.find((option) => option.value === stringValue) ||
    (selectedOptionCache?.value === stringValue ? selectedOptionCache : null)

  // Función para buscar en el servidor
  const fetchOptions = React.useCallback(
    async (searchTerm: string) => {
      if (!searchUrl) return

      setLoading(true)
      try {
        const url = new URL(searchUrl, window.location.origin)
        url.searchParams.append('search', searchTerm)
        url.searchParams.append('per_page', '10')

        const response = await fetch(url.toString(), {
          headers: {
            Accept: 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await response.json()
        setOptions(data)
      } catch (error) {
        console.error('Error fetching options:', error)
        setOptions([])
      } finally {
        setLoading(false)
      }
    },
    [searchUrl],
  )

  // Efecto para buscar cuando cambia el término de búsqueda con debounce
  React.useEffect(() => {
    if (search) {
      const timeoutId = setTimeout(() => {
        fetchOptions(search)
      }, debounceMs)

      return () => clearTimeout(timeoutId)
    } else {
      // Sin búsqueda, usar opciones iniciales
      setOptions(initialOptions)
    }
  }, [search, fetchOptions, debounceMs, initialOptions])

  // Resetear opciones al cerrar si no hay búsqueda
  React.useEffect(() => {
    if (!open && !search) {
      setOptions(initialOptions)
    }
  }, [open, initialOptions])

  // Inicializar el cache con el valor seleccionado de las opciones iniciales
  React.useEffect(() => {
    if (stringValue && initialOptions.length > 0 && !selectedOptionCache) {
      const initialSelected = initialOptions.find(
        (opt) => opt.value === stringValue,
      )
      if (initialSelected) {
        setSelectedOptionCache(initialSelected)
      }
    }
  }, [stringValue, initialOptions, selectedOptionCache])

  // Buscar el label del valor seleccionado si no está en las opciones iniciales
  React.useEffect(() => {
    const fetchSelectedOption = async () => {
      // Solo buscar si:
      // 1. Hay un valor seleccionado
      // 2. No está en las opciones actuales
      // 3. No está en el cache
      // 4. Hay una URL de búsqueda
      if (!stringValue || !searchUrl || selectedOption || loading) {
        return
      }

      setLoading(true)
      try {
        const url = new URL(searchUrl, window.location.origin)
        url.searchParams.append('id', stringValue)
        url.searchParams.append('per_page', '1')

        const response = await fetch(url.toString(), {
          headers: {
            Accept: 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await response.json()
        if (data && data.length > 0) {
          const foundOption = data[0]
          setSelectedOptionCache(foundOption)
          // Agregar también a las opciones para evitar búsquedas futuras
          setOptions((prevOptions) => {
            const exists = prevOptions.some(
              (opt) => opt.value === foundOption.value,
            )
            return exists ? prevOptions : [foundOption, ...prevOptions]
          })
        }
      } catch (error) {
        console.error('Error fetching selected option:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSelectedOption()
  }, [stringValue, searchUrl, selectedOption, loading])

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
          aria-readOnly={readOnly}
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
                <div className="flex justify-center items-center p-4">
                  <Loader2Icon className="w-5 h-5 animate-spin" />
                  <span className="ml-2 text-sm">Searching...</span>
                </div>
              )}
              {!loading && options.length === 0 && (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              )}
              {!loading && options.length > 0 && (
                <CommandGroup>
                  {options.map((option) => (
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
              )}
              {!search && !loading && (
                <div className="p-2 border-t text-muted-foreground text-xs text-center">
                  Showing {options.length} results. Type to search...
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  )
}

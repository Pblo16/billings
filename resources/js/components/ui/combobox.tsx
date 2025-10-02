'use client'

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
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

interface ComboboxProps {
  options: { value: string; label: string }[]
  value?: string | number
  onChange?: (value: string | number) => void
  readOnly?: boolean
  maxVisibleOptions?: number // Nueva prop para limitar resultados visibles
}

export function Combobox({
  options,
  value: externalValue,
  onChange,
  readOnly = false,
  maxVisibleOptions = 5, // Por defecto mostrar 5
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  options = options

  // Convertir el valor externo a string para la comparación
  // Permitir 0 como valor válido, solo rechazar undefined/null
  const stringValue =
    externalValue !== undefined && externalValue !== null
      ? externalValue.toString()
      : ''

  // Encontrar la opción seleccionada
  const selectedOption = options.find((option) => option.value === stringValue)

  // Filtrar opciones basándose en la búsqueda
  const filteredOptions = React.useMemo(() => {
    if (!search) {
      // Sin búsqueda, mostrar solo las primeras N opciones
      return options.slice(0, maxVisibleOptions)
    }
    // Con búsqueda, filtrar todas las opciones
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase()),
    )
  }, [options, search, maxVisibleOptions])

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
          {selectedOption?.label || 'Select an option'}
          <ChevronsUpDownIcon className="opacity-50 ml-2 w-4 h-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      {!readOnly && (
        <PopoverContent className="p-0 w-full">
          <Command>
            <CommandInput
              placeholder="Search an option"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      const newValue =
                        option.value === stringValue ? '' : option.value
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
              {!search &&
                filteredOptions.length === maxVisibleOptions &&
                options.length > maxVisibleOptions && (
                  <div className="p-2 text-muted-foreground text-xs text-center">
                    Showing {maxVisibleOptions} of {options.length}. Type to
                    search all...
                  </div>
                )}
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  )
}

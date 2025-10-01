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

const frameworks = [
  {
    value: 'next.js',
    label: 'Next.js',
  },
  {
    value: 'sveltekit',
    label: 'SvelteKit',
  },
  {
    value: 'nuxt.js',
    label: 'Nuxt.js',
  },
  {
    value: 'remix',
    label: 'Remix',
  },
  {
    value: 'astro',
    label: 'Astro',
  },
]

interface ComboboxProps {
  options: { value: string; label: string }[]
  value?: string | number
  onChange?: (value: string | number) => void
  readOnly?: boolean
}

export function Combobox({
  options,
  value: externalValue,
  onChange,
  readOnly = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  options = options ? options : frameworks

  // Convertir el valor externo a string para la comparación
  // Permitir 0 como valor válido, solo rechazar undefined/null
  const stringValue =
    externalValue !== undefined && externalValue !== null
      ? externalValue.toString()
      : ''

  // Encontrar la opción seleccionada
  const selectedOption = options.find((option) => option.value === stringValue)

  console.log(
    'Selected value:',
    stringValue,
    'Selected option:',
    selectedOption,
  )

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
            <CommandInput placeholder="Search an option" />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
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
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  )
}

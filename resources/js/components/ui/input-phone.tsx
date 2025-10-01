import { forwardRef } from 'react'
import { PatternFormat, PatternFormatProps } from 'react-number-format'
import { Input } from '@/components/ui/input'

export interface PhoneInputProps
  extends Omit<PatternFormatProps, 'value' | 'onValueChange' | 'format'> {
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ placeholder, value, onValueChange, ...props }, ref) => {
    const handleValueChange = (values: {
      value: string
      formattedValue: string
    }) => {
      if (onValueChange) {
        // Devolvemos el valor sin formato (solo dígitos)
        onValueChange(values.value)
      }
    }

    return (
      <PatternFormat
        value={value || ''}
        onValueChange={handleValueChange}
        format="(###) ###-####"
        mask="_"
        allowEmptyFormatting
        customInput={Input}
        placeholder={placeholder}
        getInputRef={ref}
        valueIsNumericString
        {...props}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

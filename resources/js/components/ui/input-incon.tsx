import { Input } from '@/components/ui/input'
import { useEffect, useRef, useState } from 'react'

interface InputWithIconProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'prefix' | 'suffix'
  > {
  prefix?: React.ElementType
  suffix?: React.ElementType
  clear?: boolean
  debounce?: number
  onDebouncedChange?: (value: string) => void
}

export function InputWithIcon(props: InputWithIconProps) {
  const {
    prefix: Prefix,
    suffix: Suffix,
    debounce,
    onChange,
    onDebouncedChange,
    clear,
    ...rest
  } = props
  const [value, setValue] = useState(props.value ?? '')
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setValue(props.value ?? '')
  }, [props.value])

  useEffect(() => {
    if (!debounce || !onDebouncedChange) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      onDebouncedChange(value.toString())
    }, debounce)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [value, debounce, onDebouncedChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    if (!debounce && onChange) {
      onChange(e)
    }
  }

  // Calculate padding for input
  let inputClass = ''
  const hasClear = !!clear && !!value
  if (Prefix && (Suffix || hasClear)) inputClass = 'pl-10 pr-10'
  else if (Prefix) inputClass = 'pl-10'
  else if (Suffix || hasClear) inputClass = 'pr-10'

  return (
    <div className="relative flex items-center w-full">
      {Prefix && (
        <Prefix className="left-3 absolute w-4 h-4 text-muted-foreground" />
      )}
      <Input
        className={inputClass}
        {...rest}
        value={value}
        onChange={handleChange}
      />
      {hasClear && (
        <button
          type="button"
          className="top-1/2 right-3 absolute m-0 p-0 focus:outline-none text-muted-foreground hover:text-foreground text-lg -translate-y-1/2"
          aria-label="Clear"
          tabIndex={0}
          onClick={() => setValue('')}
        >
          &#10005;
        </button>
      )}
      {!hasClear && Suffix && (
        <Suffix className="right-3 absolute w-4 h-4 text-muted-foreground" />
      )}
    </div>
  )
}

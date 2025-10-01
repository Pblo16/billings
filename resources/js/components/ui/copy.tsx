import { Check, CopyIcon } from 'lucide-react'
import { useState } from 'react'

export default function Copy({ data }: { data: string }) {
  const [copyValue, setCopyValue] = useState<boolean>(false)

  const copyValueToClipboard = (value: string) => {
    setCopyValue(true)
    return () => {
      setTimeout(() => setCopyValue(false), 2000)
      navigator.clipboard.writeText(value)
    }
  }

  return (
    <>
      {copyValue ? (
        <Check className="inline-block ml-2 w-4 h-4 text-green-500" />
      ) : (
        <CopyIcon
          onClick={() => {
            copyValueToClipboard(data)()
          }}
          className="inline-block ml-2 w-4 h-4 text-muted-foreground cursor-pointer"
        />
      )}
    </>
  )
}

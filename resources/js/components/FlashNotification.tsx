import { usePage } from '@inertiajs/react'
import { Terminal, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import LoadingBar from './ui/loading-bar'

interface FlashNotificationProps {
  duration: number // milliseconds
}

const FlashNotification: React.FC<FlashNotificationProps> = ({
  duration = 3000,
}) => {
  const { flash } = usePage().props as { flash?: Record<string, string> }
  const [visible, setVisible] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [type, setType] = useState<string>('success')
  console.log('FlashNotification render', { flash, message, type })
  useEffect(() => {
    if (flash) {
      const keys = Object.keys(flash)
      if (keys.length > 0) {
        setMessage(flash[keys[0]])
        setType(keys[0])
        setVisible(true)
        // Add a small margin so the loading bar always finishes before closing
        const margin = 120 // ms
        const timer = setTimeout(() => setVisible(false), duration + margin)
        return () => clearTimeout(timer)
      }
    }
  }, [flash, duration])

  if (!visible || !message) return null

  let variant: 'default' | 'destructive' = 'default'
  if (type === 'success') variant = 'default'
  if (type === 'error') variant = 'destructive'
  if (type === 'warning') variant = 'destructive'

  return (
    <Alert
      variant={variant}
      className="right-4 bottom-4 z-50 absolute gap-2 grid grid-cols-2 shadow-lg px-4 py-4 w-auto max-w-sm"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setVisible(false)}
        className="top-2 right-2 absolute"
      >
        <X />
      </Button>
      <Terminal />
      <div className="flex-1">
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription className="pr-2 max-w-sm">{message}</AlertDescription>
      </div>

      <LoadingBar duration={duration - 200} />
    </Alert>
  )
}

export default FlashNotification

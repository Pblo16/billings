import { usePage } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'

interface FlashNotificationProps {
  duration?: number // milliseconds
}

const FlashNotification: React.FC<FlashNotificationProps> = ({
  duration = 4000,
}) => {
  const { flash } = usePage().props as { flash?: Record<string, string> }
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [type, setType] = useState<string>('info')

  useEffect(() => {
    if (flash) {
      const keys = Object.keys(flash)
      if (keys.length > 0) {
        setMessage(flash[keys[0]])
        setType(keys[0])
        setVisible(true)
        const timer = setTimeout(() => setVisible(false), duration)
        return () => clearTimeout(timer)
      }
    }
  }, [flash, duration])

  if (!visible || !message) return null

  let bgColor = 'bg-blue-500'
  if (type === 'success') bgColor = 'bg-green-500'
  if (type === 'error') bgColor = 'bg-red-500'
  if (type === 'warning') bgColor = 'bg-yellow-500'

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow text-white ${bgColor}`}
      role="alert"
    >
      {message}
    </div>
  )
}

export default FlashNotification

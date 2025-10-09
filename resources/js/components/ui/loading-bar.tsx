import { useEffect, useState } from 'react'

interface LoadingBarProps {
  duration: number
}

const LoadingBar: React.FC<LoadingBarProps> = ({ duration }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const stepTime = 50 // Update every 50ms

    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)
      if (elapsed >= duration) {
        clearInterval(timer)
        setProgress(100)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [duration])

  return (
    <div className="col-span-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full h-2.5">
      <div
        className="bg-blue-600 rounded-full h-2.5 transition-width duration-500 ease-in-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  )
}

export default LoadingBar

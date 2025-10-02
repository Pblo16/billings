import { useCallback, useEffect, useState } from 'react'
import { set } from 'zod'

// Generic useFetch hook that returns typed data
const useFetch = <T,>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''

  const fullUrl = baseUrl + url

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal


    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(fullUrl, { ...options, signal })
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = (await response.json()) as T
        setData(result)
      } catch (err) {
        if ((err as any).name === 'AbortError') return
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullUrl, refetchTrigger])

  return { data, loading, error, refetch }
}

export default useFetch
import { useCallback, useEffect, useState } from "react"


const useFetch = (url: string, options?: RequestInit) => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''

  const fullUrl = baseUrl + url

  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(fullUrl, options)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fullUrl, options, refetchTrigger])

  return { data, loading, error, refetch }
}

export default useFetch
import { useCallback, useEffect, useState } from 'react'
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios'

// Generic useFetch hook that returns typed data
const useFetch = <T,>(url: string, options?: AxiosRequestConfig) => {
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
    const source: CancelTokenSource = axios.CancelToken.source()

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axios(fullUrl, {
          cancelToken: source.token,
          ...options,
        })
        setData(response.data as T)
      } catch (err: unknown) {
        if (axios.isCancel(err)) return
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    return () => {
      source.cancel('Request cancelled')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullUrl, refetchTrigger])

  return { data, loading, error, refetch }
}

export default useFetch
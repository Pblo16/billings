import { useCallback, useEffect, useRef, useState } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface UseCachedFetchOptions {
  cacheTime?: number // Time in milliseconds to keep cache valid (default: 5 minutes)
  enabled?: boolean // Whether to fetch data immediately
}

/**
 * Hook for fetching data with caching support.
 * Caches data in sessionStorage and reuses it when returning to the same page.
 * Cache can be invalidated manually using the invalidate function.
 */
export const useCachedFetch = <T,>(
  url: string | null,
  options: UseCachedFetchOptions = {},
) => {
  const { cacheTime = 5 * 60 * 1000, enabled = true } = options // 5 minutes default

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const fullUrl = url ? baseUrl + url : null

  // Generate cache key from URL
  const getCacheKey = useCallback((url: string) => {
    return `cached_fetch_${url}`
  }, [])

  // Get data from cache
  const getFromCache = useCallback(
    (url: string): T | null => {
      try {
        const cached = sessionStorage.getItem(getCacheKey(url))
        if (!cached) return null

        const entry: CacheEntry<T> = JSON.parse(cached)
        const now = Date.now()

        // Check if cache is still valid
        if (now - entry.timestamp < cacheTime) {
          return entry.data
        }

        // Cache expired, remove it
        sessionStorage.removeItem(getCacheKey(url))
        return null
      } catch {
        return null
      }
    },
    [getCacheKey, cacheTime],
  )

  // Save data to cache
  const saveToCache = useCallback(
    (url: string, data: T) => {
      try {
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
        }
        sessionStorage.setItem(getCacheKey(url), JSON.stringify(entry))
      } catch (error) {
        console.warn('Failed to save to cache:', error)
      }
    },
    [getCacheKey],
  )

  // Invalidate cache for specific URL or all caches
  const invalidate = useCallback(
    (specificUrl?: string) => {
      if (specificUrl) {
        const key = getCacheKey(baseUrl + specificUrl)
        sessionStorage.removeItem(key)
      } else if (fullUrl) {
        // Invalidate current URL
        sessionStorage.removeItem(getCacheKey(fullUrl))
      } else {
        // Invalidate all cached_fetch entries
        const keys = Object.keys(sessionStorage)
        keys.forEach((key) => {
          if (key.startsWith('cached_fetch_')) {
            sessionStorage.removeItem(key)
          }
        })
      }
    },
    [getCacheKey, fullUrl, baseUrl],
  )

  // Fetch data from API
  const fetchData = useCallback(
    async (forceRefetch = false) => {
      if (!fullUrl || !enabled) return

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Check cache first (unless force refetch)
      if (!forceRefetch) {
        const cachedData = getFromCache(fullUrl)
        if (cachedData) {
          setData(cachedData)
          setLoading(false)
          setError(null)
          return
        }
      }

      // Create new abort controller
      const controller = new AbortController()
      abortControllerRef.current = controller

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(fullUrl, { signal: controller.signal })
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = (await response.json()) as T
        setData(result)
        saveToCache(fullUrl, result)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    },
    [fullUrl, enabled, getFromCache, saveToCache],
  )

  // Refetch function that forces a refresh
  const refetch = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  // Initial fetch
  useEffect(() => {
    fetchData()

    return () => {
      // Cleanup: abort any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData])

  return { data, loading, error, refetch, invalidate }
}

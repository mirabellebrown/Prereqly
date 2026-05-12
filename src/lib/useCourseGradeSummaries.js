import { useEffect, useMemo, useState } from 'react'

export function useCourseGradeSummaries(courseCodes) {
  const requestKey = useMemo(
    () => [...new Set(courseCodes.map((courseCode) => courseCode?.trim()).filter(Boolean))].sort().join('|'),
    [courseCodes],
  )

  const [state, setState] = useState({
    error: null,
    fetchedKey: '',
    summaries: {},
  })

  useEffect(() => {
    if (!requestKey) {
      return
    }

    const abortController = new AbortController()
    const searchParams = new URLSearchParams()
    requestKey.split('|').forEach((courseCode) => {
      searchParams.append('course', courseCode)
    })

    fetch(`/api/grades?${searchParams.toString()}`, {
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null)
          throw new Error(errorPayload?.error ?? 'Unable to load Daily Nexus grades.')
        }

        return response.json()
      })
      .then((payload) => {
        setState({
          error: null,
          fetchedKey: requestKey,
          summaries: payload.summaries ?? {},
        })
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return
        }

        setState((current) => ({
          ...current,
          error: error.message,
          fetchedKey: requestKey,
        }))
      })

    return () => {
      abortController.abort()
    }
  }, [requestKey])

  if (!requestKey) {
    return {
      error: null,
      isLoading: false,
      summaries: {},
    }
  }

  return {
    error: state.error,
    isLoading: state.fetchedKey !== requestKey && !state.error,
    summaries: state.fetchedKey === requestKey ? state.summaries : {},
  }
}

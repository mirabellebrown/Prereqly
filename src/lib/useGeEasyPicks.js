import { useEffect, useMemo, useState } from 'react'

export function useGeEasyPicks(areaKeys) {
  const requestKey = useMemo(
    () => [...new Set(areaKeys.filter(Boolean).map((key) => key.toUpperCase()))].sort().join('|'),
    [areaKeys],
  )

  const [state, setState] = useState({
    error: null,
    fetchedKey: '',
    picksByArea: {},
    sourceUrl: 'https://dailynexus.com/interactives/grades/ges',
  })

  useEffect(() => {
    if (!requestKey) {
      return
    }

    const abortController = new AbortController()
    const searchParams = new URLSearchParams()
    requestKey.split('|').forEach((area) => {
      searchParams.append('area', area)
    })

    fetch(`/api/grades/ge-easy-picks?${searchParams.toString()}`, {
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null)
          throw new Error(errorPayload?.error ?? 'Unable to load GE easy picks.')
        }
        return response.json()
      })
      .then((payload) => {
        setState({
          error: null,
          fetchedKey: requestKey,
          picksByArea: payload.picksByArea ?? {},
          sourceUrl: payload.sourceUrl,
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
      picksByArea: {},
      sourceUrl: state.sourceUrl,
    }
  }

  return {
    error: state.error,
    isLoading: state.fetchedKey !== requestKey && !state.error,
    picksByArea: state.fetchedKey === requestKey ? state.picksByArea : {},
    sourceUrl: state.sourceUrl,
  }
}

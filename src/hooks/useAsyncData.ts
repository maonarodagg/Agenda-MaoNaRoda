import { useCallback, useEffect, useState } from 'react'

interface AsyncDataState<T> {
  data: T | null
  error: string | null
  loading: boolean
}

// Carrega dados ao montar e expõe reload(). `load` precisa ser estável (fora do componente ou useCallback).
export function useAsyncData<T>(load: () => Promise<T>, errorMessage: string) {
  const [state, setState] = useState<AsyncDataState<T>>({ data: null, error: null, loading: true })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    load()
      .then((data) => {
        if (active) setState({ data, error: null, loading: false })
      })
      .catch(() => {
        if (active) setState((prev) => ({ ...prev, error: errorMessage, loading: false }))
      })
    return () => {
      active = false
    }
  }, [load, errorMessage, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return { ...state, reload }
}

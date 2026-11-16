import { useCallback, useState } from 'react'

// Roda uma ação assíncrona controlando "carregando" e mensagem de erro.
// toMessage converte o erro em texto pra tela.
export function useAsyncAction<Args extends unknown[]>(
  action: (...args: Args) => Promise<void>,
  toMessage: (error: unknown) => string,
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const run = useCallback(
    async (...args: Args) => {
      setLoading(true)
      setError(null)
      try {
        await action(...args)
        setDone(true)
      } catch (e) {
        setError(toMessage(e))
      } finally {
        setLoading(false)
      }
    },
    [action, toMessage],
  )

  return { run, loading, error, done, setError }
}

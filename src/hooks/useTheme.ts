import { useCallback, useEffect, useState } from 'react'
import {
  THEME_STORAGE_KEY,
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '../domain/theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

// Controla o tema e aplica no <html data-theme>.
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readStoredPreference)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches)

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolved: ResolvedTheme = resolveTheme(preference, systemDark)

  useEffect(() => {
    document.documentElement.dataset.theme = resolved
  }, [resolved])

  const toggle = useCallback(() => {
    const next: ThemePreference = resolved === 'dark' ? 'light' : 'dark'
    setPreference(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // sem storage, o tema só não fica salvo
    }
  }, [resolved])

  return { preference, resolved, toggle }
}

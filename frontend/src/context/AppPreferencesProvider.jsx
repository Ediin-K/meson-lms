import { useCallback, useEffect, useMemo, useState } from 'react'
import { lookupString } from '../lib/mesonStrings.js'
import { AppPreferencesContext } from './appPreferencesContext.js'

const STORAGE_LOCALE = 'meson-locale'
const STORAGE_ROLE = 'meson-role'
const STORAGE_THEME = 'meson-theme'

function readStoredLocale() {
  try {
    const v = localStorage.getItem(STORAGE_LOCALE)
    if (v === 'sq' || v === 'en') return v
  } catch {
    /* ignore */
  }
  return 'sq'
}

function readStoredRole() {
  try {
    const v = localStorage.getItem(STORAGE_ROLE)
    if (v === 'guest' || v === 'student' || v === 'admin') return v
  } catch {
    /* ignore */
  }
  return 'guest'
}

function readStoredColorMode() {
  try {
    const v = localStorage.getItem(STORAGE_THEME)
    if (v === 'dark' || v === 'light') return v
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function AppPreferencesProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale)
  const [role, setRoleState] = useState(readStoredRole)
  const [colorMode, setColorModeState] = useState(readStoredColorMode)

  const setLocale = useCallback((next) => {
    const v = next === 'en' ? 'en' : 'sq'
    setLocaleState(v)
    try {
      localStorage.setItem(STORAGE_LOCALE, v)
    } catch {
      /* ignore */
    }
  }, [])

  const setRole = useCallback((next) => {
    const v =
      next === 'student' ? 'student' : next === 'admin' ? 'admin' : 'guest'
    setRoleState(v)
    try {
      localStorage.setItem(STORAGE_ROLE, v)
    } catch {
      /* ignore */
    }
  }, [])

  const setColorMode = useCallback((next) => {
    const v = next === 'dark' ? 'dark' : 'light'
    setColorModeState(v)
    try {
      localStorage.setItem(STORAGE_THEME, v)
    } catch {
      /* ignore */
    }
  }, [])

  const toggleColorMode = useCallback(() => {
    setColorModeState((prev) => {
      const v = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_THEME, v)
      } catch {
        /* ignore */
      }
      return v
    })
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (colorMode === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [colorMode])

  const t = useCallback(
    (path) => lookupString(locale, path),
    [locale],
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      role,
      setRole,
      colorMode,
      setColorMode,
      toggleColorMode,
      t,
    }),
    [locale, role, colorMode, setLocale, setRole, setColorMode, toggleColorMode, t],
  )

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  )
}

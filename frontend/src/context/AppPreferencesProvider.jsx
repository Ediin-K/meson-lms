import { useCallback, useMemo, useState } from 'react'
import { lookupString } from '../lib/mesonStrings.js'
import { AppPreferencesContext } from './appPreferencesContext.js'

const STORAGE_LOCALE = 'meson-locale'
const STORAGE_ROLE = 'meson-role'

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
export function AppPreferencesProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale)
  const [role, setRoleState] = useState(readStoredRole)

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

  const t = useCallback(
    (path) => lookupString(locale, path),
    [locale],
  )

  const value = useMemo(
    () => ({ locale, setLocale, role, setRole, t }),
    [locale, role, setLocale, setRole, t],
  )

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  )
}

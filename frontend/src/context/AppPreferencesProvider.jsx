import { useCallback, useEffect, useMemo, useState } from 'react'
import { lookupString } from '../lib/mesonStrings.js'
import { AppPreferencesContext } from './appPreferencesContext.js'

const STORAGE_LOCALE = 'meson-locale'
const STORAGE_ROLE = 'meson-role'
const STORAGE_ROLES = 'meson-roles'
const STORAGE_ACTIVE_ROLE = 'meson-active-role'
const STORAGE_THEME = 'meson-theme'

const ALLOWED_ROLES = ['guest', 'student', 'teacher', 'admin', 'department_head']
// Highest privilege first — mirrors the backend RoleResolver.
const ROLE_PRIORITY = ['admin', 'department_head', 'teacher', 'student']

function normalizeRole(v) {
  const s = String(v || '').toLowerCase()
  return ALLOWED_ROLES.includes(s) ? s : null
}

function primaryOf(roles) {
  for (const r of ROLE_PRIORITY) {
    if (roles.includes(r)) return r
  }
  return roles[0] || 'guest'
}

function readStoredLocale() {
  try {
    const v = localStorage.getItem(STORAGE_LOCALE)
    if (v === 'sq' || v === 'en') return v
  } catch { void 0 }
  return 'sq'
}

function readStoredRoles() {
  try {
    const raw = localStorage.getItem(STORAGE_ROLES)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map(normalizeRole).filter(Boolean)
        if (cleaned.length) return cleaned
      }
    }
    // Legacy single-role key (session predating multi-role)
    const single = normalizeRole(localStorage.getItem(STORAGE_ROLE))
    if (single) return [single]
  } catch { void 0 }
  return ['guest']
}

function readStoredActiveRole(roles) {
  try {
    const stored = normalizeRole(localStorage.getItem(STORAGE_ACTIVE_ROLE))
    if (stored && roles.includes(stored)) return stored
  } catch { void 0 }
  return primaryOf(roles)
}

function readStoredColorMode() {
  try {
    const v = localStorage.getItem(STORAGE_THEME)
    if (v === 'dark' || v === 'light') return v
  } catch { void 0 }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function AppPreferencesProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale)
  const [roles, setRolesState] = useState(readStoredRoles)
  const [activeRole, setActiveRoleState] = useState(() => readStoredActiveRole(readStoredRoles()))
  const [colorMode, setColorModeState] = useState(readStoredColorMode)
  const [isAuthenticated, setIsAuthenticated] = useState(
      !!localStorage.getItem('userId')
  )

  const persistRoles = useCallback((nextRoles, nextActive) => {
    try {
      localStorage.setItem(STORAGE_ROLES, JSON.stringify(nextRoles))
      localStorage.setItem(STORAGE_ACTIVE_ROLE, nextActive)
      localStorage.setItem(STORAGE_ROLE, nextActive) // keep legacy key in sync
    } catch { void 0 }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('userId')
    localStorage.removeItem('email')
    localStorage.removeItem(STORAGE_ROLE)
    localStorage.removeItem(STORAGE_ROLES)
    localStorage.removeItem(STORAGE_ACTIVE_ROLE)
    setIsAuthenticated(false)
    setRolesState(['guest'])
    setActiveRoleState('guest')
  }, [])

  const setLocale = useCallback((next) => {
    const v = next === 'en' ? 'en' : 'sq'
    setLocaleState(v)
    try {
      localStorage.setItem(STORAGE_LOCALE, v)
    } catch { void 0 }
  }, [])

  /** Seed the full role set (called on login); resets the active hat to the primary role. */
  const setRoles = useCallback((next) => {
    const cleaned = (Array.isArray(next) ? next : [next]).map(normalizeRole).filter(Boolean)
    const finalRoles = cleaned.length ? cleaned : ['guest']
    const primary = primaryOf(finalRoles)
    setRolesState(finalRoles)
    setActiveRoleState(primary)
    persistRoles(finalRoles, primary)
  }, [persistRoles])

  /** Legacy single-role setter — kept so existing callers still work. */
  const setRole = useCallback((next) => {
    setRoles([next])
  }, [setRoles])

  /** Switch the active "hat" among the roles the account already holds. */
  const setActiveRole = useCallback((next) => {
    const v = normalizeRole(next)
    setRolesState((current) => {
      if (v && current.includes(v)) {
        setActiveRoleState(v)
        persistRoles(current, v)
      }
      return current
    })
  }, [persistRoles])

  const setColorMode = useCallback((next) => {
    const v = next === 'dark' ? 'dark' : 'light'
    setColorModeState(v)
    try {
      localStorage.setItem(STORAGE_THEME, v)
    } catch { void 0 }
  }, [])

  const toggleColorMode = useCallback(() => {
    setColorModeState((prev) => {
      const v = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_THEME, v)
      } catch { void 0 }
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

  const value = useMemo(() => ({
    locale,
    setLocale,
    roles,
    activeRole,
    role: activeRole, // alias: "the current hat"
    setRole,
    setRoles,
    setActiveRole,
    mode: colorMode,
    colorMode,
    setColorMode,
    toggleColorMode,
    t,
    isAuthenticated,
    setIsAuthenticated,
    logout
  }), [
    locale,
    roles,
    activeRole,
    colorMode,
    t,
    isAuthenticated,
    setLocale,
    setRole,
    setRoles,
    setActiveRole,
    setColorMode,
    toggleColorMode,
    logout
  ])

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  )
}

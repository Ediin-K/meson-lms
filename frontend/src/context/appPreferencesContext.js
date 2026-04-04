import { createContext, useContext } from 'react'

export const AppPreferencesContext = createContext(null)

export function useAppPreferences() {
  const ctx = useContext(AppPreferencesContext)
  if (!ctx) {
    throw new Error('useAppPreferences must be used within AppPreferencesProvider')
  }
  return ctx
}

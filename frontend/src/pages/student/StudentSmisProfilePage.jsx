import { useEffect, useState } from 'react'
import { Alert, Box, CircularProgress, TextField, Typography } from '@mui/material'
import { getStudentProfile } from '../../services/studentProfileService'
import SmisPageHeader from '../../components/smis/SmisPageHeader'

const DEFAULT_STUDENT_PROGRAM = 'Shkenca kompjuterike dhe inxhinieri'

const fields = [
  ['Student ID', 'id'],
  ['Email', 'email'],
  ['First name', 'emri'],
  ['Parent name', 'parentName'],
  ['Last name', 'mbiemri'],
  ['Date of birth', 'dateOfBirth'],
  ['Gender', 'gender'],
  ['Birthplace', 'birthplace'],
  ['Program', 'categoryName'],
  ['Academic year', 'academicYear'],
  ['Status', 'statusi'],
]

export default function StudentSmisProfilePage() {
  const userId = localStorage.getItem('userId')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    getStudentProfile(userId)
      .then((data) => {
        if (active) setProfile(data)
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Profili nuk mund te lexohet')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [userId])

  if (loading) {
    return <Box className="flex min-h-[320px] items-center justify-center"><CircularProgress /></Box>
  }

  return (
    <>
      <SmisPageHeader
        eyebrow="Profili"
        title="Profili im"
        subtitle="Te dhenat jane vetem per lexim dhe sinkronizohen me llogarine tuaj Meson LMS."
      />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="p-5 sm:p-6">
        {error && <Alert severity="error" className="!mb-4">{error}</Alert>}
        <div className="mb-5 flex gap-2 border-b border-slate-200 dark:border-slate-800">
          <span className="rounded-t-lg border border-b-0 border-slate-200 bg-slate-950 px-4 py-2 text-sm font-bold text-white dark:border-slate-700">
            Informatat personale
          </span>
          <span className="px-4 py-2 text-sm font-semibold text-sky-700 dark:text-sky-300">Kontaktet</span>
          <span className="px-4 py-2 text-sm font-semibold text-sky-700 dark:text-sky-300">Foto</span>
        </div>
        <div className="grid max-w-5xl gap-4 md:grid-cols-2">
          {fields.map(([label, key]) => (
            <TextField
              key={key}
              label={label}
              value={key === 'categoryName' ? (profile?.categoryName || DEFAULT_STUDENT_PROGRAM) : (profile?.[key] ?? '')}
              size="small"
              InputProps={{ readOnly: true }}
              fullWidth
            />
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

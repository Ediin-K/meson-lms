import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, Chip, CircularProgress } from '@mui/material'
import DescriptionRounded from '@mui/icons-material/DescriptionRounded'
import SmisPageHeader from '../../components/smis/SmisPageHeader'
import TranscriptView from '../../components/transcript/TranscriptView'
import { getStudentProfile } from '../../services/studentProfileService'
import { getGradesByStudent } from '../../services/gradeService'

const DEFAULT_STUDENT_PROGRAM = 'Shkenca kompjuterike dhe inxhinieri'

export default function StudentTranscriptPage() {
  const userId = localStorage.getItem('userId')
  const [profile, setProfile] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [error, setError] = useState('')

  const loadBaseData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getStudentProfile(userId)
      setProfile(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Te dhenat e studentit nuk mund te lexohen.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadBaseData()
  }, [loadBaseData])

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      const data = await getGradesByStudent(userId)
      setSummary(data)
      setShowTranscript(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Transkripta nuk mund te gjenerohet.')
    } finally {
      setGenerating(false)
    }
  }

  const program = profile?.categoryName || DEFAULT_STUDENT_PROGRAM
  const semester = profile?.currentSemester ? `Semestri ${profile.currentSemester}` : 'Semestri 6'
  const status = profile?.statusi || 'Aktiv'

  if (loading) {
    return <Box className="flex min-h-[320px] items-center justify-center"><CircularProgress /></Box>
  }

  return (
    <>
      <SmisPageHeader
        eyebrow="Transkripta"
        title="Transkripta e Notave"
        subtitle="Gjeneroni transkripten akademike per te pare listen e notave, kredite ECTS dhe permbledhjen e suksesit."
      />

      {error ? <Alert severity="error" className="!mb-4">{error}</Alert> : null}

      <div className="print-hide rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto p-5 sm:p-6">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <tr>
                {['Drejtimi', 'Semestri', 'Statusi', 'Transkripta'].map((h) => (
                  <th key={h} className="border-b border-slate-200 px-3 py-3 font-bold dark:border-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white dark:bg-slate-900">
                <td className="border-b border-slate-100 px-3 py-3 font-semibold dark:border-slate-800">{program}</td>
                <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{semester}</td>
                <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                  <Chip size="small" label={status} className="!bg-emerald-100 !font-bold !text-emerald-800 dark:!bg-emerald-950 dark:!text-emerald-200" />
                </td>
                <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                  <Button
                    variant="contained"
                    startIcon={<DescriptionRounded />}
                    disabled={generating}
                    onClick={handleGenerate}
                    className="!rounded-lg !bg-sky-700 !font-bold !normal-case hover:!bg-sky-800"
                  >
                    {generating ? 'Duke gjeneruar...' : 'Gjenero Transkriptën'}
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showTranscript ? (
        <div className="mt-5">
          <TranscriptView profile={profile} summary={summary} />
        </div>
      ) : null}
    </>
  )
}

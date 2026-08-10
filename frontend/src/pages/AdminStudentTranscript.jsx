import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, Container, Typography } from '@mui/material'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import Footer from '../components/ui/Footer'
import TranscriptView from '../components/transcript/TranscriptView'
import { getStudentProfile } from '../services/studentProfileService'
import { getGradesByStudent } from '../services/gradeService'
import { useAppPreferences } from '../context/appPreferencesContext'

export default function AdminStudentTranscript() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { t } = useAppPreferences()

  const [profile, setProfile] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [profileData, summaryData] = await Promise.all([
        getStudentProfile(studentId),
        getGradesByStudent(studentId),
      ])
      setProfile(profileData)
      setSummary(summaryData)
    } catch (err) {
      setError(err?.response?.data?.message || t('adminStudentTranscript.loadError'))
    } finally {
      setLoading(false)
    }
  }, [studentId, t])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section className="flex flex-col min-h-screen">
      <Container maxWidth="lg" className="grow py-8 mt-4 sm:mt-8">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate('/admin/users')}
          className="print-hide mb-6! normal-case! text-slate-600! dark:text-slate-400!"
        >
          {t('adminStudentTranscript.back')}
        </Button>

        <Typography variant="h4" component="h1" className="print-hide mb-6! font-extrabold! text-slate-900! dark:text-white!">
          {t('adminStudentTranscript.title')}
        </Typography>

        {error ? <Alert severity="error" className="!mb-4">{error}</Alert> : null}

        {loading ? (
          <Box className="flex justify-center py-24"><CircularProgress /></Box>
        ) : (
          <TranscriptView profile={profile} summary={summary} />
        )}
      </Container>
      <Footer />
    </section>
  )
}

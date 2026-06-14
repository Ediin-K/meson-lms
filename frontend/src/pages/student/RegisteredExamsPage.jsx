import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, Chip, CircularProgress, Snackbar, Typography } from '@mui/material'
import { cancelExamApplication, getStudentExamApplications, refuseExamGrade } from '../../services/smisService'
import SmisPageHeader from '../../components/smis/SmisPageHeader'

const chipColor = {
  REGISTERED: 'info',
  GRADED: 'success',
  REFUSED: 'warning',
  CANCELLED: 'default',
}

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-')

export default function RegisteredExamsPage() {
  const userId = localStorage.getItem('userId')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const loadRows = useCallback(async () => {
    setLoading(true)
    try {
      const applications = await getStudentExamApplications(userId)
      setRows(applications.filter((row) => row.status !== 'CANCELLED'))
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Gabim gjate leximit te provimeve', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadRows()
  }, [loadRows])

  const runAction = async (row, action) => {
    setBusyId(row.id)
    try {
      if (action === 'cancel') {
        await cancelExamApplication(userId, row.id)
        setSnackbar({ open: true, message: 'Paraqitja u anulua.', severity: 'success' })
      } else {
        await refuseExamGrade(userId, row.id)
        setSnackbar({ open: true, message: 'Nota u refuzua.', severity: 'success' })
      }
      await loadRows()
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Veprimi nuk mund te kryhet', severity: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
    <SmisPageHeader
      eyebrow="Statusi i provimeve"
      title="Provimet e paraqitura"
      subtitle="Monitoroni paraqitjet, notat, anulimet dhe refuzimin e notes nga nje tabele e vetme."
    />
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="p-5 sm:p-6">
        {loading ? (
          <Box className="flex min-h-[260px] items-center justify-center"><CircularProgress /></Box>
        ) : rows.length === 0 ? (
          <Alert severity="info">Ende nuk keni paraqitur provime.</Alert>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  {['Kodi', 'Lenda', 'Kategoria', 'Profesori', 'Nota', 'Statusi i notes', 'Data vendosjes notes', 'Anulo paraqitjen', 'Refuzo noten'].map((h) => (
                    <th key={h} className="border-b border-slate-200 px-3 py-3 font-bold dark:border-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const canCancel = row.status === 'REGISTERED' && !row.grade
                  const canRefuse = row.status === 'GRADED' && Boolean(row.grade)
                  return (
                    <tr key={row.id} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/70">
                      <td className="border-b border-slate-100 px-3 py-3 font-bold text-sky-800 dark:border-slate-800 dark:text-sky-300">{row.courseCode}</td>
                      <td className="border-b border-slate-100 px-3 py-3 font-semibold dark:border-slate-800">{row.courseName}</td>
                      <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{row.category}</td>
                      <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{row.professorName}</td>
                      <td className="border-b border-slate-100 px-3 py-3 font-bold dark:border-slate-800">{row.grade ?? '-'}</td>
                      <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                        <Chip size="small" label={row.status} color={chipColor[row.status] || 'default'} className="!font-bold dark:!text-white" />
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{formatDate(row.gradeAssignedAt)}</td>
                      <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                        <Button variant="contained" disabled={!canCancel || busyId === row.id} onClick={() => runAction(row, 'cancel')} className="!rounded-md !font-bold !normal-case disabled:!bg-slate-700 disabled:!text-slate-300">
                          Anulo paraqitjen
                        </Button>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                        <Button variant="outlined" disabled={!canRefuse || busyId === row.id} onClick={() => runAction(row, 'refuse')} className="!rounded-md !font-bold !normal-case disabled:!border-slate-600 disabled:!text-slate-300">
                          Refuzo noten
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
    </>
  )
}

import { useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, MenuItem, Select, Snackbar, Typography } from '@mui/material'
import { getAvailableExamCourses, registerExam } from '../../services/smisService'
import SmisPageHeader from '../../components/smis/SmisPageHeader'

export default function ExamRegistrationPage() {
  const userId = localStorage.getItem('userId')
  const [courses, setCourses] = useState([])
  const [professors, setProfessors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    getAvailableExamCourses()
      .then(setCourses)
      .catch((err) => setSnackbar({ open: true, message: err?.response?.data?.message || 'Gabim gjate leximit te provimeve', severity: 'error' }))
      .finally(() => setLoading(false))
  }, [])

  const handleRegister = async (course) => {
    const professorId = professors[course.id]
    if (!professorId) {
      setSnackbar({ open: true, message: 'Ju lutem zgjidhni profesorin para paraqitjes se provimit.', severity: 'warning' })
      return
    }
    setSubmittingId(course.id)
    try {
      await registerExam(userId, { courseId: course.id, professorId })
      setCourses((prev) => prev.filter((item) => item.id !== course.id))
      setProfessors((prev) => {
        const next = { ...prev }
        delete next[course.id]
        return next
      })
      setSnackbar({ open: true, message: 'Provimi u paraqit me sukses.', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Provimi nuk mund te paraqitet', severity: 'error' })
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <>
    <SmisPageHeader
      eyebrow="Provimet"
      title="Paraqitja e provimeve"
      subtitle="Zgjidhni lenden dhe profesorin perpara se te dergoni paraqitjen e provimit."
    />
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="p-5 sm:p-6">
        <Alert severity="info" className="!mb-4">
          Para se te paraqitni provimin, zgjidhni profesorin tek i cili keni ndjekur lenden.
        </Alert>
        {loading ? (
          <Box className="flex min-h-[260px] items-center justify-center"><CircularProgress /></Box>
        ) : courses.length === 0 ? (
          <Alert severity="success">
            Te gjitha provimet e disponueshme jane paraqitur ose nuk ka provime te hapura per paraqitje.
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  {['Kodi', 'Lenda', 'Kredit (ECTS)', 'Semestri', 'Kategoria', 'Zgjidhe profesorin', 'Paraqite provimin'].map((h) => (
                    <th key={h} className="border-b border-slate-200 px-3 py-3 font-bold dark:border-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/70">
                    <td className="border-b border-slate-100 px-3 py-3 font-bold text-sky-800 dark:border-slate-800 dark:text-sky-300">{course.code}</td>
                    <td className="border-b border-slate-100 px-3 py-3 font-semibold dark:border-slate-800">{course.name}</td>
                    <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{course.ects}</td>
                    <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">Semestri {course.semester}</td>
                    <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{course.category}</td>
                    <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                      <Select
                        value={professors[course.id] || ''}
                        onChange={(e) => setProfessors((prev) => ({ ...prev, [course.id]: e.target.value }))}
                        displayEmpty
                        size="small"
                        fullWidth
                      >
                        <MenuItem value="">Zgjidhe ligjeruesin</MenuItem>
                        {(course.professors || []).map((p) => (
                          <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
                      </Select>
                    </td>
                    <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                      <Button variant="contained" disabled={submittingId === course.id} onClick={() => handleRegister(course)} className="!rounded-lg !bg-sky-700 !font-bold !normal-case hover:!bg-sky-800">
                        Paraqite provimin
                      </Button>
                    </td>
                  </tr>
                ))}
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

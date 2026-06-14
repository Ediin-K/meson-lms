import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Box, Button, Chip, CircularProgress, TextField, Typography, Snackbar } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { deleteExamGrade, getProfessorExamApplications, submitExamGrade } from '../../services/smisService'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-')

export default function ProfessorExamPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const loadRows = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await getProfessorExamApplications())
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Gabim gjate leximit te paraqitjeve', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRows()
  }, [loadRows])

  const setField = (id, key, value) => {
    setForm((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }))
  }

  const courseSections = useMemo(() => {
    const grouped = new Map()
    rows.forEach((row) => {
      const key = row.courseId || row.courseCode
      if (!grouped.has(key)) {
        grouped.set(key, {
          courseId: row.courseId,
          courseName: row.courseName,
          courseCode: row.courseCode,
          category: row.category,
          rows: [],
        })
      }
      grouped.get(key).rows.push(row)
    })

    return Array.from(grouped.values()).map((section) => ({
      ...section,
      total: section.rows.length,
      registered: section.rows.filter((r) => r.status === 'REGISTERED').length,
      graded: section.rows.filter((r) => r.status === 'GRADED').length,
      refused: section.rows.filter((r) => r.status === 'REFUSED').length,
      cancelled: section.rows.filter((r) => r.status === 'CANCELLED').length,
    }))
  }, [rows])

  const handleSubmit = async (row) => {
    const grade = Number(form[row.id]?.grade ?? row.grade)
    if (!grade || grade < 5 || grade > 10) {
      setSnackbar({ open: true, message: 'Nota duhet te jete nga 5 deri ne 10.', severity: 'warning' })
      return
    }
    setBusyId(row.id)
    try {
      await submitExamGrade(row.id, { grade, comment: form[row.id]?.comment || row.comment || '' })
      setSnackbar({ open: true, message: 'Nota u ruajt me sukses.', severity: 'success' })
      await loadRows()
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Nota nuk mund te ruhet', severity: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  const handleDeleteGrade = async (row) => {
    if (!row.grade) {
      setSnackbar({ open: true, message: 'Kjo paraqitje nuk ka note per fshirje.', severity: 'warning' })
      return
    }

    setBusyId(row.id)
    try {
      await deleteExamGrade(row.id)
      setForm((prev) => ({ ...prev, [row.id]: { grade: '', comment: '' } }))
      setSnackbar({ open: true, message: 'Nota u fshi. Paraqitja u kthye ne REGISTERED.', severity: 'success' })
      await loadRows()
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Nota nuk mund te fshihet', severity: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="min-h-screen bg-[#eef3f8] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700 dark:text-sky-300">Meson LMS SMIS</p>
            <h1 className="text-2xl font-black tracking-tight">Staff / Professor Portal</h1>
          </div>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate('/teacher')}
            className="!rounded-full !border-slate-300 !px-4 !py-2 !font-bold !normal-case !text-slate-700 dark:!border-slate-700 dark:!text-slate-200"
          >
            Kthehu ne LMS
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800">
          <Typography variant="overline" className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400">
            Provimet e paraqitura
          </Typography>
          <Typography variant="h4" component="h1" className="!font-bold !text-slate-900 dark:!text-white">
            Vleresimi i provimeve
          </Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-500 dark:!text-slate-400">
            Paraqitjet jane te ndara sipas lendeve. Cdo seksion tregon studentet qe kane paraqitur provimin per ate lende.
          </Typography>
        </div>
        <div className="p-5">
          {loading ? (
            <Box className="flex min-h-[300px] items-center justify-center"><CircularProgress /></Box>
          ) : rows.length === 0 ? (
            <Alert severity="info">Nuk ka paraqitje provimesh per kurset tuaja.</Alert>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Lende</p>
                  <p className="mt-1 text-2xl font-black">{courseSections.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Paraqitje</p>
                  <p className="mt-1 text-2xl font-black">{rows.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Me note</p>
                  <p className="mt-1 text-2xl font-black">{rows.filter((r) => r.status === 'GRADED').length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Pa note</p>
                  <p className="mt-1 text-2xl font-black">{rows.filter((r) => r.status === 'REGISTERED').length}</p>
                </div>
              </div>

              {courseSections.map((section) => (
                <section key={section.courseId || section.courseCode} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-sky-700 dark:text-sky-300">{section.courseCode}</p>
                      <Typography variant="h6" className="!font-black !text-slate-950 dark:!text-white">
                        {section.courseName}
                      </Typography>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{section.category}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Chip label={`${section.total} paraqitje`} className="!bg-slate-100 !font-bold !text-slate-800 dark:!bg-slate-700 dark:!text-white" />
                      <Chip label={`${section.registered} pa note`} className="!bg-sky-100 !font-bold !text-sky-800 dark:!bg-sky-950 dark:!text-sky-200" />
                      <Chip label={`${section.graded} me note`} className="!bg-emerald-100 !font-bold !text-emerald-800 dark:!bg-emerald-950 dark:!text-emerald-200" />
                      <Chip label={`${section.refused} refuzuar`} className="!bg-amber-100 !font-bold !text-amber-800 dark:!bg-amber-950 dark:!text-amber-200" />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                      <thead className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        <tr>
                          {['Studenti', 'Student ID', 'Data paraqitjes', 'Statusi', 'Nota', 'Koment', 'Veprime'].map((h) => (
                            <th key={h} className="border-b border-slate-200 px-3 py-3 font-bold dark:border-slate-700">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.rows.map((row) => (
                          <tr key={row.id} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/70">
                            <td className="border-b border-slate-100 px-3 py-3 font-semibold dark:border-slate-800">{row.studentName}</td>
                            <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{row.studentId}</td>
                            <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{formatDate(row.appliedAt)}</td>
                            <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                              <Chip size="small" label={row.status} className="!bg-slate-100 !font-bold !text-slate-800 dark:!bg-slate-700 dark:!text-white" />
                            </td>
                            <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                              <TextField size="small" type="number" inputProps={{ min: 5, max: 10 }} value={form[row.id]?.grade ?? row.grade ?? ''} onChange={(e) => setField(row.id, 'grade', e.target.value)} />
                            </td>
                            <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                              <TextField size="small" value={form[row.id]?.comment ?? row.comment ?? ''} onChange={(e) => setField(row.id, 'comment', e.target.value)} placeholder="Koment opsional" />
                            </td>
                            <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                              <div className="flex flex-wrap gap-2">
                                <Button variant="contained" disabled={busyId === row.id || row.status === 'CANCELLED'} onClick={() => handleSubmit(row)} className="!rounded-md !font-bold !normal-case disabled:!bg-slate-700 disabled:!text-slate-300">
                                  Ruaj noten
                                </Button>
                                <Button color="error" variant="outlined" disabled={busyId === row.id || !row.grade} onClick={() => handleDeleteGrade(row)} className="!rounded-md !font-bold !normal-case disabled:!border-slate-600 disabled:!text-slate-300">
                                  Fshi noten
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </section>
  )
}

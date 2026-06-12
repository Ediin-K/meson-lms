import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, MenuItem, Select, Typography } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { getAdminExamApplications, getAdminSmisSummary } from '../services/smisService'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'

const statuses = ['', 'REGISTERED', 'GRADED', 'REFUSED', 'CANCELLED']
const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-')

export default function AdminSmisDashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [summaryData, rowsData] = await Promise.all([
        getAdminSmisSummary(),
        getAdminExamApplications(status),
      ])
      setSummary(summaryData)
      setRows(rowsData)
    } catch (err) {
      setError(err?.response?.data?.message || 'SMIS te dhenat nuk mund te lexohen')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  const cards = [
    ['Registered exams', summary?.registered ?? 0, 'REGISTERED'],
    ['Graded exams', summary?.graded ?? 0, 'GRADED'],
    ['Refused grades', summary?.refused ?? 0, 'REFUSED'],
    ['Cancelled exams', summary?.cancelled ?? 0, 'CANCELLED'],
  ]

  const manageLinks = [
    ['Students', '/admin/users'],
    ['Professors', '/admin/teachers'],
    ['Courses', '/admin/courses'],
    ['Programs', '/admin/categories'],
    ['Exam registrations', '/admin/smis'],
    ['Grades', '/admin/smis'],
    ['Payments', '/admin/smis'],
    ['Basic reports', '/admin/reports'],
  ]

  return (
    <section className="min-h-screen bg-[#eef3f8] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700 dark:text-sky-300">Meson LMS SMIS</p>
            <h1 className="text-2xl font-black tracking-tight">Admin Portal</h1>
          </div>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate('/admin')}
            className="!rounded-full !border-slate-300 !px-4 !py-2 !font-bold !normal-case !text-slate-700 dark:!border-slate-700 dark:!text-slate-200"
          >
            Kthehu ne LMS
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Typography variant="overline" className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400">Paneli SMIS</Typography>
          <Typography variant="h4" component="h1" className="!font-bold !text-slate-900 dark:!text-white">Menaxhimi akademik</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-500 dark:!text-slate-400">
            Monitoro paraqitjet e provimeve, notat, refuzimet dhe anulimet ne nje vend.
          </Typography>
        </div>

        {error && <Alert severity="error" className="!mb-4">{error}</Alert>}

        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value, filter]) => (
            <Card key={label} elevation={0} className="!rounded-xl !border !border-slate-200 !bg-white !shadow-sm dark:!border-slate-800 dark:!bg-slate-900">
              <CardContent>
                <Typography variant="caption" className="!font-bold !uppercase !tracking-widest !text-slate-500">{label}</Typography>
                <Typography variant="h4" className="!mt-1 !font-bold !text-slate-900 dark:!text-white">{value}</Typography>
                <Button size="small" onClick={() => setStatus(filter)} className="!mt-2 !normal-case">Filtro</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Typography variant="h6" className="!mb-3 !font-bold">Menaxhimi</Typography>
          <div className="flex flex-wrap gap-2">
            {manageLinks.map(([label, to]) => (
              <Button key={label} component={Link} to={to} variant="outlined" className="!rounded-full !normal-case">
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <Typography variant="h6" className="!font-bold">Exam registrations</Typography>
            <Select size="small" value={status} onChange={(e) => setStatus(e.target.value)} displayEmpty className="sm:w-56">
              {statuses.map((s) => <MenuItem key={s || 'ALL'} value={s}>{s || 'All statuses'}</MenuItem>)}
            </Select>
          </div>
          <div className="p-5">
            {loading ? (
              <Box className="flex min-h-[260px] items-center justify-center"><CircularProgress /></Box>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <tr>
                      {['Student', 'Course', 'Professor', 'Status', 'Grade', 'Applied', 'Grade date'].map((h) => (
                        <th key={h} className="border-b border-slate-200 px-3 py-3 font-bold dark:border-slate-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/70">
                        <td className="border-b border-slate-100 px-3 py-3 font-semibold dark:border-slate-800">{row.studentName}</td>
                        <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{row.courseCode} - {row.courseName}</td>
                        <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{row.professorName}</td>
                        <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800"><Chip size="small" label={row.status} className="!bg-slate-100 !font-bold !text-slate-800 dark:!bg-slate-700 dark:!text-white" /></td>
                        <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{row.grade ?? '-'}</td>
                        <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{formatDate(row.appliedAt)}</td>
                        <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{formatDate(row.gradeAssignedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

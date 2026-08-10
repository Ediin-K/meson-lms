import { useMemo } from 'react'
import { Alert, Button, Typography } from '@mui/material'
import PrintRounded from '@mui/icons-material/PrintRounded'

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-')

export default function TranscriptView({ profile, summary }) {
  const rows = summary?.grades || []
  const bySemester = useMemo(
    () => [...(summary?.bySemester || [])].sort((a, b) => a.semester - b.semester),
    [summary],
  )

  const stats = useMemo(() => [
    ['Mesatarja (GPA)', summary?.averageGrade ? summary.averageGrade.toFixed(2) : '-'],
    ['Nota gjithsej', summary?.totalGrades ?? 0],
    ['ECTS me note', summary?.totalEcts ?? 0],
    ['ECTS regjistruar', summary?.totalEnrolledEcts ?? 0],
  ], [summary])

  return (
    <div className="print-area rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
        <div>
          <Typography variant="h6" className="!font-black !text-slate-950 dark:!text-white">
            Transkripta akademike
          </Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-500 dark:!text-slate-400">
            Studenti: {profile?.emri} {profile?.mbiemri} · ID: {profile?.id}
          </Typography>
        </div>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PrintRounded />}
          onClick={() => window.print()}
          className="print-hide !rounded-lg !normal-case !font-bold"
        >
          Printo / Ruaj si PDF
        </Button>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        {rows.length === 0 ? (
          <Alert severity="info">Nuk ka nota te vendosura ende per transkripte.</Alert>
        ) : (
          <div className="flex flex-col gap-6">
            {bySemester.map((sem) => (
              <div key={sem.semester}>
                <div className="mb-2 flex items-baseline justify-between">
                  <Typography variant="subtitle1" className="!font-black !text-slate-800 dark:!text-slate-100">
                    Semestri {sem.semester}
                  </Typography>
                  <Typography variant="body2" className="!font-bold !text-slate-500 dark:!text-slate-400">
                    GPA: {sem.gpa?.toFixed(2) ?? '-'} · ECTS: {sem.ects}
                  </Typography>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <tr>
                        {['Kodi', 'Lenda', 'Profesori', 'Nota', 'ECTS', 'Data', 'Koment'].map((h) => (
                          <th key={h} className="border-b border-slate-200 px-3 py-3 font-bold dark:border-slate-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sem.grades.map((row) => (
                        <tr key={row.id} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/70">
                          <td className="border-b border-slate-100 px-3 py-3 font-bold text-sky-800 dark:border-slate-800 dark:text-sky-300">
                            MESON{String(row.subjectId).padStart(3, '0')}
                          </td>
                          <td className="border-b border-slate-100 px-3 py-3 font-semibold dark:border-slate-800">{row.subjectTitulli}</td>
                          <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{row.professorEmri}</td>
                          <td className="border-b border-slate-100 px-3 py-3 font-black dark:border-slate-800">{row.grade}</td>
                          <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{row.subjectEcts ?? 5}</td>
                          <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{formatDate(row.assignedAt)}</td>
                          <td className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">{row.comment || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

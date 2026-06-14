import { Box, Card, CardContent, Chip, Typography } from '@mui/material'
import GradeRounded from '@mui/icons-material/GradeRounded'

function gradeColor(grade) {
  if (grade == null) return 'default'
  if (grade >= 8) return 'success'
  if (grade >= 6) return 'primary'
  if (grade >= 5) return 'warning'
  return 'error'
}

export default function ProfileGradesSection({ summary, t }) {
  const grades = summary?.grades || []

  return (
    <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!border-slate-700/80 dark:!bg-slate-900">
      <CardContent className="!p-6">
        <Typography variant="h6" className="!mb-4 !flex !items-center !gap-2 !font-extrabold !text-slate-900 dark:!text-white">
          <GradeRounded className="text-amber-500" fontSize="small" />
          {t('account.gradesTitle')}
        </Typography>

        {/* Summary tiles */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          <SummaryTile
            label={t('account.gradesAverage')}
            value={summary?.averageGrade != null ? summary.averageGrade.toFixed(2) : '—'}
            accent="text-amber-600"
          />
          <SummaryTile
            label={t('account.gradesCount')}
            value={summary?.totalGrades ?? 0}
            accent="text-sky-600"
          />
          <SummaryTile
            label={t('account.gradesEcts')}
            value={`${summary?.totalEcts ?? 0}/${summary?.totalEnrolledEcts ?? 0}`}
            accent="text-emerald-600"
          />
        </div>

        {grades.length === 0 ? (
          <Typography variant="body2" className="!text-slate-500">
            {t('account.gradesEmpty')}
          </Typography>
        ) : (
          <div className="flex flex-col gap-2">
            {grades.map((g) => (
              <div key={g.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                <div className="min-w-0 flex-1">
                  <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white truncate">
                    {g.subjectTitulli}
                  </Typography>
                  {g.comment ? (
                    <Typography variant="caption" className="!block !text-slate-500 truncate">
                      {g.comment}
                    </Typography>
                  ) : null}
                </div>
                {g.subjectEcts != null && (
                  <Typography variant="caption" className="!text-slate-400 shrink-0">
                    {g.subjectEcts} ECTS
                  </Typography>
                )}
                <Chip label={g.grade ?? '—'} size="small" color={gradeColor(g.grade)} className="!font-bold shrink-0" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SummaryTile({ label, value, accent }) {
  return (
    <Box className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-center dark:border-slate-700/80 dark:bg-slate-800/40">
      <Typography variant="h6" className={`!font-extrabold ${accent}`}>{value}</Typography>
      <Typography variant="caption" className="!font-semibold !uppercase !tracking-wide !text-slate-400">
        {label}
      </Typography>
    </Box>
  )
}

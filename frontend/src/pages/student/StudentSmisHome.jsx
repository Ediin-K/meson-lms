import { Link } from 'react-router-dom'
import { Box, Card, CardContent, Chip, Typography } from '@mui/material'
import PersonRounded from '@mui/icons-material/PersonRounded'
import AddTaskRounded from '@mui/icons-material/AddTaskRounded'
import ReceiptLongRounded from '@mui/icons-material/ReceiptLongRounded'
import PaymentsRounded from '@mui/icons-material/PaymentsRounded'
import GradeRounded from '@mui/icons-material/GradeRounded'
import SmisPageHeader from '../../components/smis/SmisPageHeader'

const cards = [
  { title: 'Profili im', body: 'Te dhenat personale, programi, statusi akademik dhe viti i studimit.', to: '/student/smis/profile', icon: PersonRounded, meta: 'Readonly' },
  { title: 'Transkripta / Notat', body: 'Shiko notat, ECTS dhe permbledhjen akademike brenda portalit SMIS.', to: '/student/smis/grades', icon: GradeRounded, meta: 'Akademike' },
  { title: 'Paraqit provimet', body: 'Zgjidh lenden dhe profesorin per te paraqitur provimin.', to: '/student/smis/exams/register', icon: AddTaskRounded, meta: 'Provime' },
  { title: 'Provimet e paraqitura', body: 'Ndiq statusin, noten, anulimet dhe refuzimin e notes.', to: '/student/smis/exams/registered', icon: ReceiptLongRounded, meta: 'Status' },
  { title: 'Pagesat', body: 'Pamja e pagesave dhe detyrimeve financiare te studentit.', to: '/student/smis/payments', icon: PaymentsRounded, meta: 'Financa' },
]

export default function StudentSmisHome() {
  return (
    <Box>
      <SmisPageHeader
        eyebrow="Student Portal"
        title="Sherbimet akademike"
        subtitle="Menaxho profilin, notat, provimet dhe pagesat nga nje portal i organizuar per studentet e Meson LMS."
        actions={<Chip label="Meson LMS SMIS" className="!bg-sky-100 !font-bold !text-sky-800 dark:!bg-sky-950 dark:!text-sky-200" />}
      />

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm dark:border-slate-800">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">Status</p>
          <h2 className="mt-2 text-2xl font-black">Portali aktiv</h2>
          <p className="mt-2 text-sm text-slate-300">Qasja juaj ne sherbimet akademike eshte gati per perdorim.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Provimet</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Regjistrim online</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Zgjidh profesorin dhe regjistro provimin me validim.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Notat</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Gjurmim i qarte</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Shiko statuset REGISTERED, GRADED, REFUSED dhe CANCELLED.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} component={Link} to={card.to} elevation={0} className="group !rounded-xl !border !border-slate-200 !bg-white no-underline !shadow-sm transition hover:-translate-y-1 hover:!border-sky-300 hover:!shadow-lg dark:!border-slate-800 dark:!bg-slate-900">
            <CardContent className="!p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100 transition group-hover:bg-sky-700 group-hover:text-white dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-900">
                  <card.icon />
                </div>
                <Chip size="small" label={card.meta} className="!bg-slate-100 !font-bold !text-slate-800 dark:!bg-slate-700 dark:!text-white" />
              </div>
              <Typography variant="h6" className="!font-bold !text-slate-900 dark:!text-white">
                {card.title}
              </Typography>
              <Typography variant="body2" className="!mt-2 !text-slate-600 dark:!text-slate-400">
                {card.body}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </Box>
  )
}

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import HomeRounded from '@mui/icons-material/HomeRounded'
import PersonRounded from '@mui/icons-material/PersonRounded'
import GradeRounded from '@mui/icons-material/GradeRounded'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'
import AddTaskRounded from '@mui/icons-material/AddTaskRounded'
import ReceiptLongRounded from '@mui/icons-material/ReceiptLongRounded'
import PaymentsRounded from '@mui/icons-material/PaymentsRounded'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import { useAppPreferences } from '../context/appPreferencesContext'

const navItems = [
  { label: 'Home', to: '/student/smis', icon: HomeRounded, end: true },
  { label: 'Profili im', to: '/student/smis/profile', icon: PersonRounded },
  { label: 'Transkripta / Notat', to: '/student/smis/grades', icon: GradeRounded },
  { label: 'Provimet', to: '/student/smis/exams/register', icon: AssignmentRounded },
  { label: 'Paraqit provimet', to: '/student/smis/exams/register', icon: AddTaskRounded },
  { label: 'Provimet e paraqitura', to: '/student/smis/exams/registered', icon: ReceiptLongRounded },
  { label: 'Pagesat', to: '/student/smis/payments', icon: PaymentsRounded },
]

export default function StudentSmisLayout() {
  const navigate = useNavigate()
  const { logout } = useAppPreferences()
  const email = localStorage.getItem('email') || 'student@meson.local'

  return (
    <section className="min-h-screen bg-[#eef3f8] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700 dark:text-sky-300">Meson LMS SMIS</p>
            <h1 className="text-2xl font-black tracking-tight">Student Academic Portal</h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Sherbime akademike, provime, nota dhe pagesa</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {email}
            </span>
            <button
              type="button"
              onClick={() => navigate('/student')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <ArrowBackRounded fontSize="small" />
              LMS
            </button>
            <button
              type="button"
              onClick={async () => {
                await logout()
                navigate('/login/student')
              }}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700"
            >
              <LogoutRounded fontSize="small" />
              Dil
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[286px_1fr] lg:px-8">
        <aside className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-6 lg:h-fit">
          <div className="mb-3 rounded-xl bg-slate-950 px-4 py-4 text-white dark:bg-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-widest text-sky-200">Sherbimet akademike</p>
            <h2 className="mt-1 text-lg font-black">Menu SMIS</h2>
          </div>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Student portal">
            {navItems.map((item) => (
              <NavLink
                key={`${item.label}-${item.to}`}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-w-fit items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold no-underline transition ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-sm dark:bg-sky-700'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-sky-800 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`
                }
              >
                <item.icon fontSize="small" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </section>
  )
}

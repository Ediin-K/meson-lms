import { useMemo, useState } from 'react'
import { Alert, Button, CircularProgress, TextField } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { login } from '../services/authService'
import { useAppPreferences } from '../context/appPreferencesContext'

const portalConfig = {
  student: {
    title: 'Student - Login',
    destination: '/student/smis',
    expectedRole: 'student',
  },
  staff: {
    title: 'Staff - Login',
    destination: '/teacher/smis/exams',
    expectedRole: 'teacher',
  },
  admin: {
    title: 'Admin - Login',
    destination: '/admin/smis',
    expectedRole: 'admin',
  },
}

function MesonMark() {
  return (
    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[6px] border-[#23145f] bg-white text-[#23145f] shadow-sm">
      <div className="text-center">
        <div className="text-4xl font-black leading-none">M</div>
        <div className="mt-1 border-t border-[#23145f] pt-1 text-[10px] font-black uppercase tracking-widest">Meson</div>
      </div>
    </div>
  )
}

export default function SmisPortalLogin() {
  const { portal = 'student' } = useParams()
  const config = portalConfig[portal] || portalConfig.student
  const navigate = useNavigate()
  const { setIsAuthenticated, setRole, isAuthenticated, role } = useAppPreferences()

  const [email, setEmail] = useState(localStorage.getItem('email') || '')
  const [password, setPassword] = useState('')
  const [showFields, setShowFields] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canContinue = useMemo(
    () => isAuthenticated && (!config.expectedRole || role === config.expectedRole),
    [isAuthenticated, role, config.expectedRole],
  )

  const handleMesonLogin = async () => {
    setError('')

    if (canContinue) {
      navigate(config.destination, { replace: true })
      return
    }

    if (!showFields) {
      setShowFields(true)
      return
    }

    if (!email.trim() || !password) {
      setError('Shkruani email-in dhe fjalekalimin per Meson Account.')
      return
    }

    setLoading(true)
    try {
      const data = await login(email, password)
      const resolvedRole = data.role?.toLowerCase()

      if (resolvedRole !== config.expectedRole) {
        setError('Llogaria nuk ka qasje ne kete portal.')
        return
      }

      setIsAuthenticated(true)
      setRole(resolvedRole)
      localStorage.setItem('meson-role', resolvedRole)
      navigate(config.destination, { replace: true })
    } catch (err) {
      setError(err?.message || 'Kyçja nuk u krye me sukses.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex min-h-screen flex-col bg-white text-slate-900">
      <div className="h-10 w-full bg-[#073b6d] shadow-md" />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-6">
          <MesonMark />
        </div>

        <div className="w-full max-w-[625px] overflow-hidden rounded-[5px] border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-300 bg-gradient-to-b from-white to-slate-100 px-6 py-4">
            <h1 className="text-2xl font-bold text-slate-800">{config.title}</h1>
          </div>

          <div className="px-6 py-6">
            <div className="mb-6 rounded-md border border-sky-200 bg-sky-100 px-4 py-3 text-sm text-sky-800">
              <strong>MESON LMS - Vërejtje!</strong> Në shërbimet elektronike mund të qaseni me Meson Account-in tuaj zyrtar.
            </div>

            {error ? <Alert severity="error" className="!mb-4">{error}</Alert> : null}

            {showFields && !canContinue ? (
              <div className="mb-5 grid gap-3">
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="small"
                  type="email"
                  autoComplete="email"
                  fullWidth
                />
                <TextField
                  label="Fjalekalimi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="small"
                  type="password"
                  autoComplete="current-password"
                  fullWidth
                />
              </div>
            ) : null}

            <div className="border-t border-slate-200 bg-slate-50 px-4 py-5">
              <Button
                fullWidth
                variant="contained"
                disabled={loading}
                onClick={handleMesonLogin}
                className="!mx-auto !flex !max-w-[340px] !rounded-md !bg-[#0876cc] !py-2.5 !font-bold !normal-case hover:!bg-[#0665ad]"
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Kyçu me Meson Account'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-700">
        <p>© 2012 - 2026 <span className="text-sky-700">Meson LMS</span> - Prishtinë, Kosovë</p>
        <p>Tel:+383 38 541 400 | info@meson-lms.local</p>
        <p className="mt-3 text-sky-700">www.meson.education</p>
      </footer>
    </section>
  )
}

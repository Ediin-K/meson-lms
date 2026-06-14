import { useMemo, useState } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'

import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService.js'
import InputField from '../components/auth/InputField.jsx'
import PasswordField from '../components/auth/PasswordField.jsx'
import LoginSubmitButton from '../components/login/LoginSubmitButton.jsx'
import { isValidEmailFormat } from '../lib/authValidation.js'
import { useAppPreferences } from '../context/appPreferencesContext.js'

function MicrosoftIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 23 23" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M12 1h10v10H12z" />
      <path fill="#7fba00" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  )
}

function validateEmail(v, t) {
  if (!v.trim()) return t('auth.emailReq')
  if (!isValidEmailFormat(v)) return t('auth.emailInv')
  return ''
}

function validatePassword(v, t) {
  if (!v) return t('auth.passReq')
  return ''
}

const portalCopy = {
  student: {
    title: 'Student Portal',
    subtitle: 'Kycu me Meson Account per te menaxhuar profilin, provimet dhe notat.',
  },
  staff: {
    title: 'Staff / Professor Portal',
    subtitle: 'Kycu me Meson Account per te vleresuar provimet dhe per te menaxhuar kurset.',
  },
  admin: {
    title: 'Admin Portal',
    subtitle: 'Kycu me Meson Account per administrimin e Meson LMS dhe SMIS.',
  },
}

export default function Login({ portalType }) {
  const { setIsAuthenticated, colorMode, setRole, t } = useAppPreferences()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const navigate = useNavigate()

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: colorMode,
          primary: { main: '#4F46E5' },
          secondary: { main: '#22C55E' },
          background: {
            default: colorMode === 'dark' ? '#0f172a' : '#F9FAFB',
            paper: colorMode === 'dark' ? '#1e293b' : '#FFFFFF',
          },
          error: { main: '#EF4444' },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
        },
        components: {
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
        },
      }),
    [colorMode],
  )

  const errors = useMemo(
    () => ({
      email: validateEmail(email, t),
      password: validatePassword(password, t),
    }),
    [email, password, t],
  )

  const getFieldError = (field) => {
    if (!attemptedSubmit) return ''
    return errors[field] || ''
  }

  const clearGlobalError = () => setGlobalError('')
  const copy = portalCopy[portalType]

  const handleSubmit = async (e) => {

    e.preventDefault()

    const errs = {
      email: validateEmail(email, t),
      password: validatePassword(password, t),
    }

    setAttemptedSubmit(true)
    if (errs.email || errs.password) return

    setLoading(true)
    setGlobalError('')

    try {
      const data = await login(email, password)

      if (data.mustChangePassword) {
        navigate('/change-password', { replace: true })
        return
      }

      localStorage.setItem('email', data.email)
      setIsAuthenticated(true)

      if (data.role) {
        setRole(data.role)
        localStorage.setItem('meson-role', data.role)
      }

      const role = data.role?.toLowerCase()
      const storedRedirect = sessionStorage.getItem('meson-post-login-redirect')
      if (storedRedirect) {
        sessionStorage.removeItem('meson-post-login-redirect')
        navigate(storedRedirect, { replace: true })
        return
      }
      const destination =
        role === 'admin'
          ? '/admin'
          : role === 'teacher'
            ? '/teacher'
            : role === 'student'
              ? '/student'
              : '/'
      navigate(destination, { replace: true })
    } catch (error) {
      setGlobalError(error?.message || 'Gabim në login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="flex min-h-dvh flex-col bg-[#F9FAFB] text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">

        <main
          className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-12"
          aria-labelledby="login-heading"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100/80 via-[#F9FAFB] to-indigo-100/70 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/40"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-30"
            aria-hidden
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 20%, rgba(79, 70, 229, 0.12), transparent 45%), radial-gradient(circle at 85% 10%, rgba(14, 165, 233, 0.1), transparent 40%), radial-gradient(circle at 50% 90%, rgba(148, 163, 184, 0.12), transparent 55%)',
            }}
          />

          <div className="relative w-full max-w-[420px]">
            <div className="rounded-[12px] border border-slate-200/90 bg-white/90 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-md transition-colors dark:border-slate-700/90 dark:bg-slate-900/85 dark:shadow-black/40 sm:p-9">
              <Typography
                id="login-heading"
                variant="h4"
                component="h1"
                className="font-bold tracking-tight text-slate-900 dark:text-white"
              >
                {copy?.title || t('auth.loginTitle')}
              </Typography>
              <Typography variant="body2" className="mt-2 text-slate-600 dark:text-slate-400">
                {copy?.subtitle || t('auth.loginSubtitle')}
              </Typography>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                {globalError && (
                  <Alert
                    severity="error"
                    role="alert"
                    onClose={clearGlobalError}
                    className="rounded-[12px]"
                    sx={{ alignItems: 'center' }}
                  >
                    {globalError}
                  </Alert>
                )}

                <div className="mb-6 sm:mb-8">
                  <InputField
                    id="email"
                    label={t('auth.emailLabel')}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      clearGlobalError()
                    }}
                    error={getFieldError('email')}
                    type="email"
                    autoComplete="email"
                    autoFocus
                    startIcon={EmailOutlinedIcon}
                    inputProps={{ 'aria-label': 'Email address' }}
                  />
                </div>

                <div className="space-y-3">
                  <PasswordField
                    id="password"
                    label={t('auth.passwordLabel')}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearGlobalError()
                    }}
                    error={getFieldError('password')}
                    showPassword={showPassword}
                    onToggleVisibility={() => setShowPassword((s) => !s)}
                    showStrength={false}
                    showCapsLockHint
                    autoComplete="current-password"
                  />
                  <div className="flex justify-end">
                    <Link
                      href="#"
                      underline="hover"
                      className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>
                </div>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      color="primary"
                      slotProps={{
                        input: { 'aria-label': 'Remember me on this device' }
                      }}
                    />
                  }
                  label={
                    <span className="text-sm text-slate-600 dark:text-slate-400">{t('auth.rememberMe')}</span>
                  }
                />

                <LoginSubmitButton loading={loading}>{t('auth.loginSubmit')}</LoginSubmitButton>

                <div className="flex items-center gap-3 py-1">
                  <span
                    className="h-px flex-1 bg-slate-200 transition-colors dark:bg-slate-600"
                    aria-hidden
                  />
                  <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Kycu me Meson Account
                  </span>
                  <span
                    className="h-px flex-1 bg-slate-200 transition-colors dark:bg-slate-600"
                    aria-hidden
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-slate-300 hover:shadow-md  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
                    aria-label="Kycu me Meson Account"
                  >
                    <MicrosoftIcon />
                    Kycu me Meson Account
                  </button>
                </div>

                {!portalType && (
                  <div className="grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
                    <Link href="/login/student" underline="hover" className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                      Student portal
                    </Link>
                    <Link href="/login/staff" underline="hover" className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                      Staff portal
                    </Link>
                    <Link href="/login/admin" underline="hover" className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                      Admin portal
                    </Link>
                  </div>
                )}

                <Typography variant="body2" className="text-center text-slate-600 dark:text-slate-400">
                  {t('auth.adminOnlyAccount')}
                </Typography>

              </form>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

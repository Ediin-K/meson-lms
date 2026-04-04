import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'

import Header from '../components/ui/Header.jsx'
import InputField from '../components/register/InputField.jsx'
import RoleCard from '../components/register/RoleCard.jsx'
import PasswordField from '../components/register/PasswordField.jsx'
import RegisterButton from '../components/register/RegisterButton.jsx'
import {
  getPasswordStrength,
  isValidEmailFormat,
  suggestRoleFromEmail,
} from '../lib/registerValidation.js'

const ROLES = [
  {
    id: 'student',
    title: 'Student',
    description: 'Take courses, submit assignments, and track grades.',
  },
  {
    id: 'instructor',
    title: 'Instructor',
    description: 'Create content, grade work, and manage your classes.',
  },
  {
    id: 'parent',
    title: 'Parent / Guardian',
    description: 'Stay informed about a learner’s progress and school updates.',
  },
]

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  terms: false,
}

function validateFirstName(v) {
  if (!v.trim()) return 'First name is required'
  return ''
}

function validateLastName(v) {
  if (!v.trim()) return 'Last name is required'
  return ''
}

function validateEmail(v) {
  if (!v.trim()) return 'Email is required'
  if (!isValidEmailFormat(v)) return 'Enter a valid email address'
  return ''
}

function validatePassword(v) {
  if (!v) return 'Password is required'
  if (v.length < 8) return 'Use at least 8 characters'
  return ''
}

function validateConfirm(password, confirm) {
  if (!confirm) return 'Confirm your password'
  if (confirm !== password) return 'Passwords do not match'
  return ''
}

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

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export default function Register() {
  const [mode, setMode] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light',
  )
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [roleSuggestion, setRoleSuggestion] = useState(null)
  const [roleDismissed, setRoleDismissed] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    return () => root.classList.remove('dark')
  }, [mode])

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#4F46E5' },
          secondary: { main: '#22C55E' },
          background: {
            default: mode === 'dark' ? '#0f172a' : '#F9FAFB',
            paper: mode === 'dark' ? '#1e293b' : '#FFFFFF',
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
    [mode],
  )

  const passwordStrength = useMemo(() => getPasswordStrength(values.password), [values.password])

  const validationErrors = useMemo(
    () => ({
      firstName: validateFirstName(values.firstName),
      lastName: validateLastName(values.lastName),
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      confirmPassword: validateConfirm(values.password, values.confirmPassword),
      terms:
        attemptedSubmit && !values.terms
          ? 'You must accept the terms and privacy policy'
          : '',
    }),
    [values, attemptedSubmit],
  )

  const getFieldError = (field) => {
    if (field === 'terms') return attemptedSubmit ? validationErrors.terms : ''
    const show = touched[field] || attemptedSubmit
    if (!show) return ''
    return validationErrors[field] || ''
  }

  const touch = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleChange = (field) => (e) => {
    const value = field === 'terms' ? e.target.checked : e.target.value
    touch(field)
    setValues((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'email') {
        const s = suggestRoleFromEmail(value)
        setRoleSuggestion(s)
        setRoleDismissed(false)
      }
      return next
    })
  }

  const handleEmailBlur = () => {
    touch('email')
    const s = suggestRoleFromEmail(values.email)
    setRoleSuggestion(s)
  }

  const applySuggestedRole = () => {
    if (!roleSuggestion) return
    setValues((prev) => ({ ...prev, role: roleSuggestion }))
    setRoleDismissed(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {
      firstName: validateFirstName(values.firstName),
      lastName: validateLastName(values.lastName),
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      confirmPassword: validateConfirm(values.password, values.confirmPassword),
      terms: !values.terms ? 'You must accept the terms and privacy policy' : '',
    }
    setAttemptedSubmit(true)
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    })
    if (Object.values(errs).some(Boolean)) return
    console.info('Register payload (demo)', {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      role: values.role,
    })
  }

  const showRoleHint =
    roleSuggestion &&
    roleSuggestion !== values.role &&
    isValidEmailFormat(values.email) &&
    !roleDismissed

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="flex min-h-dvh flex-col bg-[#F9FAFB] text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        <Header />

        <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-sky-50/70 via-[#F9FAFB] to-indigo-50/40 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/40">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-30"
            aria-hidden
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 10%, rgba(14, 165, 233, 0.12), transparent 42%), radial-gradient(circle at 85% 30%, rgba(79, 70, 229, 0.08), transparent 38%), radial-gradient(circle at 50% 100%, rgba(148, 163, 184, 0.15), transparent 50%)',
            }}
          />
          <div className="relative mx-auto w-full max-w-md px-4 py-10 sm:px-6 sm:py-14">
            <div className="mb-4 flex justify-end">
              <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                <IconButton
                  type="button"
                  onClick={() => setMode((m) => (m === 'dark' ? 'light' : 'dark'))}
                  aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  size="small"
                  className="text-slate-600 dark:text-slate-300"
                >
                  {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
                </IconButton>
              </Tooltip>
            </div>

            <div className="rounded-[12px] border border-slate-200/90 bg-white/90 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-md transition-colors dark:border-slate-700/90 dark:bg-slate-900/85 dark:shadow-black/40 sm:p-9">
          <Typography variant="h4" component="h1" className="font-bold tracking-tight text-slate-900 dark:text-white">
            Create your account
          </Typography>
          <Typography variant="body2" className="mt-2 text-slate-600 dark:text-slate-400">
            Join Meson to start learning with structure and support—free to get started.
          </Typography>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                id="firstName"
                label="First name"
                value={values.firstName}
                onChange={handleChange('firstName')}
                onBlur={() => touch('firstName')}
                error={getFieldError('firstName')}
                autoFocus
                autoComplete="given-name"
                startIcon={PersonOutlineIcon}
              />
              <InputField
                id="lastName"
                label="Last name"
                value={values.lastName}
                onChange={handleChange('lastName')}
                onBlur={() => touch('lastName')}
                error={getFieldError('lastName')}
                autoComplete="family-name"
                startIcon={PersonOutlineIcon}
              />
            </div>

            <InputField
              id="email"
              label="School email"
              value={values.email}
              onChange={handleChange('email')}
              onBlur={handleEmailBlur}
              error={getFieldError('email')}
              type="email"
              autoComplete="email"
              startIcon={EmailOutlinedIcon}
            />

            {showRoleHint && (
              <div
                className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm dark:border-emerald-900/60 dark:bg-emerald-950/40"
                role="status"
              >
                <span className="text-slate-700 dark:text-slate-200">
                  Suggested role based on your email:{' '}
                  <strong className="capitalize text-emerald-800 dark:text-emerald-300">
                    {roleSuggestion === 'parent' ? 'Parent / Guardian' : roleSuggestion}
                  </strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={applySuggestedRole}
                    className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    Use suggested role
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleDismissed(true)}
                    className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-400"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <fieldset className="min-w-0 border-0 p-0">
              <legend className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Choose your role</legend>
              <div role="radiogroup" aria-label="Choose your role" className="flex flex-col gap-3">
                {ROLES.map((r) => (
                  <RoleCard
                    key={r.id}
                    roleId={r.id}
                    title={r.title}
                    description={r.description}
                    selected={values.role === r.id}
                    onSelect={() => {
                      setValues((prev) => ({ ...prev, role: r.id }))
                      setRoleDismissed(true)
                    }}
                  />
                ))}
              </div>
            </fieldset>

            <PasswordField
              id="password"
              label="Password"
              value={values.password}
              onChange={handleChange('password')}
              onBlur={() => touch('password')}
              error={getFieldError('password')}
              showPassword={showPassword}
              onToggleVisibility={() => setShowPassword((s) => !s)}
              strength={passwordStrength}
              showStrength
            />

            <PasswordField
              id="confirmPassword"
              label="Confirm password"
              value={values.confirmPassword}
              onChange={handleChange('confirmPassword')}
              onBlur={() => touch('confirmPassword')}
              error={getFieldError('confirmPassword')}
              showPassword={showConfirmPassword}
              onToggleVisibility={() => setShowConfirmPassword((s) => !s)}
              showStrength={false}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={values.terms}
                  onChange={handleChange('terms')}
                  color="primary"
                  aria-describedby="terms-description"
                />
              }
              label={
                <span id="terms-description" className="text-sm text-slate-600 dark:text-slate-400">
                  I agree to the{' '}
                  <Link
                    href="#"
                    underline="always"
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="#"
                    underline="always"
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Privacy Policy
                  </Link>
                </span>
              }
            />
            {attemptedSubmit && validationErrors.terms && (
              <p className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400" role="alert">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                {validationErrors.terms}
              </p>
            )}

            <RegisterButton type="submit">Start learning</RegisterButton>

            <div className="flex items-center gap-3 py-2">
              <span
                className="h-px flex-1 bg-slate-200 transition-colors dark:bg-slate-600"
                aria-hidden
              />
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Or continue with
              </span>
              <span
                className="h-px flex-1 bg-slate-200 transition-colors dark:bg-slate-600"
                aria-hidden
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-slate-300 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
                aria-label="Continue with Google"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-slate-300 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
                aria-label="Continue with Microsoft"
              >
                <MicrosoftIcon />
                Microsoft
              </button>
            </div>

            <Typography variant="body2" className="text-center text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                className="font-semibold text-indigo-600 underline-offset-2 transition-colors hover:text-indigo-500 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Log in
              </Link>
            </Typography>
          </form>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

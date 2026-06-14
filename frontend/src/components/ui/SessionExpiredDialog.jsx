import { useEffect, useState } from 'react'
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography,
} from '@mui/material'
import LockClockRounded from '@mui/icons-material/LockClockRounded'
import { SESSION_EXPIRED_EVENT } from '../../services/axiosInstance'
import { useAppPreferences } from '../../context/appPreferencesContext.js'

/**
 * Shown when the access token expired and refresh failed. Instead of silently
 * redirecting (losing unsaved form input), it warns the user and lets them
 * choose when to leave. The current path is stored so login returns here.
 */
export default function SessionExpiredDialog() {
    const { t } = useAppPreferences()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const onExpired = () => setOpen(true)
        window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
    }, [])

    const goToLogin = () => {
        try {
            sessionStorage.setItem('meson-post-login-redirect', window.location.pathname)
        } catch { void 0 }
        localStorage.removeItem('userId')
        localStorage.removeItem('email')
        window.location.href = '/login'
    }

    return (
        <Dialog open={open} maxWidth="xs" fullWidth
            PaperProps={{ className: 'rounded-2xl! dark:bg-slate-900!' }}>
            <DialogTitle className="!font-bold dark:!text-white flex items-center gap-2">
                <LockClockRounded className="text-amber-600" />
                {t('auth.sessionExpiredTitle')}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" className="dark:!text-slate-300">
                    {t('auth.sessionExpiredBody')}
                </Typography>
            </DialogContent>
            <DialogActions className="!px-6 !pb-4">
                <Button onClick={() => setOpen(false)} className="!normal-case !text-slate-600">
                    {t('auth.sessionExpiredStay')}
                </Button>
                <Button variant="contained" onClick={goToLogin}
                    className="!rounded-xl !normal-case !bg-sky-600 hover:!bg-sky-700">
                    {t('auth.sessionExpiredLogin')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

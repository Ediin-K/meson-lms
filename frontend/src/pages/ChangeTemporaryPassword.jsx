import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Alert, Button, Card, CardContent, CircularProgress,
    Container, TextField, Typography,
} from '@mui/material'
import LockResetRounded from '@mui/icons-material/LockResetRounded'
import { changeTemporaryPassword } from '../services/authService.js'
import { useAppPreferences } from '../context/appPreferencesContext.js'

export default function ChangeTemporaryPassword() {
    const { setIsAuthenticated, setRole, t } = useAppPreferences()
    const navigate = useNavigate()

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword]         = useState('')
    const [confirm, setConfirm]                 = useState('')
    const [error, setError]                     = useState('')
    const [loading, setLoading]                 = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (newPassword.length < 8) return setError(t('auth.tempTooShort'))
        if (newPassword !== confirm) return setError(t('auth.tempMismatch'))
        if (newPassword === currentPassword) return setError(t('auth.tempSameAsOld'))

        setLoading(true)
        try {
            const data = await changeTemporaryPassword(currentPassword, newPassword)
            setIsAuthenticated(true)
            if (data.role) setRole(data.role)
            const role = data.role?.toLowerCase()
            const destination =
                role === 'admin' ? '/admin'
                : role === 'teacher' ? '/teacher'
                : role === 'student' ? '/student'
                : '/'
            navigate(destination, { replace: true })
        } catch (err) {
            setError(err?.message || t('auth.tempError'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container maxWidth="sm" className="py-16">
            <Card elevation={0} className="rounded-2xl border border-slate-200 dark:!bg-slate-900/50 dark:!border-slate-700">
                <CardContent className="!p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <LockResetRounded className="text-sky-600 !text-3xl" />
                        <Typography variant="h5" className="!font-extrabold !text-slate-900 dark:!text-white">
                            {t('auth.tempPasswordTitle')}
                        </Typography>
                    </div>
                    <Typography variant="body2" className="!text-slate-500 !mb-6">
                        {t('auth.tempPasswordSubtitle')}
                    </Typography>

                    {error && <Alert severity="error" className="!mb-4 !rounded-xl">{error}</Alert>}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <TextField
                            label={t('auth.tempCurrentLabel')}
                            type="password"
                            size="small"
                            fullWidth
                            required
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                        />
                        <TextField
                            label={t('auth.tempNewLabel')}
                            type="password"
                            size="small"
                            fullWidth
                            required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                        <TextField
                            label={t('auth.tempConfirmLabel')}
                            type="password"
                            size="small"
                            fullWidth
                            required
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || !currentPassword || !newPassword || !confirm}
                            className="!rounded-xl !normal-case !bg-sky-600 hover:!bg-sky-700 !py-2"
                        >
                            {loading ? <CircularProgress size={20} className="!text-white" /> : t('auth.tempSubmitBtn')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Container>
    )
}

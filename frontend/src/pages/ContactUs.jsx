import { useMemo, useState } from 'react'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import LinearProgress from '@mui/material/LinearProgress'

/* 🎨 STYLE (LIGHT + DARK) */
const inputStyle = {
    '& .MuiInputBase-input': { color: '#0f172a' },
    '& .MuiInputBase-input::placeholder': { color: '#64748b', opacity: 1 },
    '& .MuiInputLabel-root': { color: '#475569' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#0284c7' },

    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#cbd5f5' },
        '&:hover fieldset': { borderColor: '#94a3b8' },
        '&.Mui-focused fieldset': { borderColor: '#0284c7' },
    },

    /* DARK */
    '.dark & .MuiInputBase-input': { color: '#fff' },
    '.dark & .MuiInputBase-input::placeholder': { color: '#94a3b8' },
    '.dark & .MuiInputLabel-root': { color: '#cbd5f5' },
    '.dark & .MuiOutlinedInput-root fieldset': { borderColor: '#475569' },
}

/* 🧠 STATE */
const initialForm = {
    category: '',
    course: '',
    subject: '',
    message: '',
    name: '',
    email: '',
    consent: false,
}

export default function Contact() {
    const [form, setForm] = useState(initialForm)
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(false)

    const messageProgress = useMemo(() => {
        return Math.min(100, (form.message.length / 600) * 100)
    }, [form.message])

    const handleChange = (field) => (e) => {
        const value =
            e.target.type === 'checkbox' ? e.target.checked : e.target.value

        setForm((p) => ({ ...p, [field]: value }))
        setErrors((p) => ({ ...p, [field]: undefined }))
        setSubmitted(false)
    }

    const validate = () => {
        const e = {}

        if (!form.category) e.category = 'Required'
        if (!form.subject.trim()) e.subject = 'Required'
        if (form.message.trim().length < 15) e.message = 'Too short'
        if (!form.name.trim()) e.name = 'Required'
        if (!form.email.trim()) e.email = 'Required'
        if (!form.consent) e.consent = 'Required'

        return e
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = validate()
        setErrors(err)

        if (Object.keys(err).length) return
        setSubmitted(true)
    }

    const handleReset = () => {
        setForm(initialForm)
        setErrors({})
        setSubmitted(false)
    }

    return (
        <Container maxWidth="sm" className="!py-10">
            <Box className="rounded-3xl border p-6 shadow-xl bg-white dark:bg-slate-900">

                {/* HEADER */}
                <Typography variant="h4" className="font-bold text-slate-900 dark:text-white">
                    Support
                </Typography>
                <Typography className="mt-1 text-slate-600 dark:text-slate-400">
                    Na trego problemin tend
                </Typography>

                {submitted && (
                    <Alert severity="success" className="mt-4">
                        Kerkesa u dergua ✔
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} className="mt-6">
                    <Grid container spacing={3}>

                        {/* 1. PROBLEMI */}
                        <Grid item xs={12}>
                            <Typography className="font-semibold text-slate-800 dark:text-white">
                                Problemi
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Kategoria"
                                value={form.category}
                                onChange={handleChange('category')}
                                error={!!errors.category}
                                helperText={errors.category}
                                fullWidth
                                sx={inputStyle}
                            >
                                <MenuItem value="platform">Platform</MenuItem>
                                <MenuItem value="course">Course</MenuItem>
                                <MenuItem value="account">Account</MenuItem>
                                <MenuItem value="other">Tjeter</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Kursi (opsional)"
                                value={form.course}
                                onChange={handleChange('course')}
                                fullWidth
                                sx={inputStyle}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Subjekti"
                                value={form.subject}
                                onChange={handleChange('subject')}
                                error={!!errors.subject}
                                helperText={errors.subject}
                                fullWidth
                                sx={inputStyle}
                            />
                        </Grid>

                        {/* 2. MESAZHI */}
                        <Grid item xs={12}>
                            <Typography className="font-semibold text-slate-800 dark:text-white">
                                Pershkrimi
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Shpjego problemin..."
                                value={form.message}
                                onChange={handleChange('message')}
                                error={!!errors.message}
                                helperText={errors.message || `${form.message.length}/600`}
                                multiline
                                minRows={6}
                                fullWidth
                                sx={inputStyle}
                            />
                            <LinearProgress
                                value={messageProgress}
                                variant="determinate"
                                className="mt-2"
                            />
                        </Grid>

                        {/* 3. USER */}
                        <Grid item xs={12}>
                            <Typography className="font-semibold text-slate-800 dark:text-white">
                                Informacioni yt
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Emri"
                                value={form.name}
                                onChange={handleChange('name')}
                                error={!!errors.name}
                                helperText={errors.name}
                                fullWidth
                                sx={inputStyle}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Email"
                                value={form.email}
                                onChange={handleChange('email')}
                                error={!!errors.email}
                                helperText={errors.email}
                                fullWidth
                                sx={inputStyle}
                            />
                        </Grid>

                        {/* 4. SUBMIT */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={form.consent}
                                        onChange={handleChange('consent')}
                                    />
                                }
                                label="Pranoj kushtet"
                                className="text-slate-700 dark:text-white"
                            />
                            {errors.consent && (
                                <Typography className="text-red-500 text-sm">
                                    {errors.consent}
                                </Typography>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" fullWidth>
                                Dergo
                            </Button>

                            <Button onClick={handleReset} fullWidth className="mt-2">
                                Reset
                            </Button>
                        </Grid>

                    </Grid>
                </Box>
            </Box>
        </Container>
    )
}
import { useMemo, useRef, useState } from 'react'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Footer from '../components/ui/Footer.jsx'
import { useAppPreferences } from '../context/appPreferencesContext.js'



const inputStyle = {
    '& .MuiInputBase-input': { color: '#0f172a' },
    '& .MuiInputBase-input::placeholder': { color: '#64748b', opacity: 1 },
    '& .MuiInputLabel-root': { color: '#475569' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#4F46E5' },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#e2e8f0' },
        '&:hover fieldset': { borderColor: '#94a3b8' },
        '&.Mui-focused fieldset': { borderColor: '#4F46E5' },
    },
    '.dark & .MuiInputBase-input': { color: '#f1f5f9' },
    '.dark & .MuiInputBase-input::placeholder': { color: '#94a3b8', opacity: 1 },
    '.dark & .MuiInputLabel-root': { color: '#94a3b8' },
    '.dark & .MuiOutlinedInput-root fieldset': { borderColor: '#334155' },
}

const SELECT_SLOT_PROPS = {
    select: { MenuProps: { disableScrollLock: true } },
}

const ACCORDION_SX = {
    '&:before': { display: 'none' },
    borderBottom: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'transparent',
    backgroundImage: 'none',
}


const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const initialForm = {
    name: '',
    email: '',
    role: '',
    topic: '',
    message: '',
}



function SelectField({ label, value, onChange, error, helperText, options }) {
    return (
        <TextField
            select
            label={label}
            value={value}
            onChange={onChange}
            error={error}
            helperText={helperText}
            fullWidth
            sx={inputStyle}
            slotProps={SELECT_SLOT_PROPS}
        >
            {options.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                    {o.label}
                </MenuItem>
            ))}
        </TextField>
    )
}

export default function Support() {
    const { t } = useAppPreferences()
    const [form, setForm] = useState(initialForm)
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const contactRef = useRef(null)

    const charCount = useMemo(() => Math.min(form.message.length, 600), [form.message])

    const handleChange = (field) => (e) => {
        let value = e.target.value
        if (field === 'message' && value.length > 600) value = value.slice(0, 600)
        setForm((p) => ({ ...p, [field]: value }))
        setErrors((p) => ({ ...p, [field]: undefined }))
        setSubmitted(false)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = validate(form)
        setErrors(err)
        if (Object.keys(err).length) return
        setSubmitted(true)
        setForm(initialForm)
    }

    const handleReset = () => {
        setForm(initialForm)
        setErrors({})
        setSubmitted(false)
    }

    const FAQ_ITEMS = [
        {
            q: t('support.faq.q1'),
            a: t('support.faq.a1'),
        },
        {
            q: t('support.faq.q2'),
            a: t('support.faq.a2'),
        },
        {
            q: t('support.faq.q3'),
            a: t('support.faq.a3'),
        },
        {
            q: t('support.faq.q4'),
            a: t('support.faq.a4'),
        },
        {
            q: t('support.faq.q5'),
            a: t('support.faq.a5'),
        },
        {
            q: t('support.faq.q6'),
            a: t('support.faq.a6'),
        },
    ]
    const ROLE_OPTIONS = [
        { value: 'student', label: t('support.role_options.s') },
        { value: 'teacher', label: t('support.role_options.t') },
        { value: 'parent', label: t('support.role_options.p') },
    ]


    const TOPIC_OPTIONS = [
        { value: 'access', label: t('support.topic.a') },
        { value: 'course', label: t('support.topic.c')  },
        { value: 'grade', label: t('support.topic.g')  },
        { value: 'technical', label: t('support.topic.t')  },
        { value: 'billing', label: t('support.topic.p')  },
        { value: 'other', label: t('support.topic.o')  },
    ]


    function validate(form) {
        const e = {}
        if (!form.name.trim()) e.name = t('support.validate.name')
        if (!isValidEmail(form.email)) e.email = t('support.validate.email')
        if (!form.role) e.role = t('support.validate.role')
        if (!form.topic) e.topic = t('support.validate.topic')
        if (form.message.trim().length < 15) e.message = t('support.validate.message')
        return e
    }


    return (
        <Box className="flex min-h-screen flex-col">
            <Container maxWidth="md" className="!flex-1 !py-10">
                <Box className="space-y-8">

                    <Box className="text-center">
                        <Typography variant="h5" className="font-bold text-slate-900 dark:text-white">
                            {t('support.header.h1')}
                        </Typography>
                        <Typography variant="body2" className="mt-1 text-slate-500 dark:text-slate-400">
                            {t('support.header.h2')}
                        </Typography>
                    </Box>

                    <Box className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-700/90 dark:bg-slate-900">
                        <Typography variant="h6" className="mb-4 font-semibold text-slate-900 dark:text-white">
                            {t('support.header.faq')}
                        </Typography>
                        {FAQ_ITEMS.map((item, i) => (
                            <Accordion key={i} disableGutters elevation={0} sx={ACCORDION_SX}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="body2" className="font-medium text-slate-800 dark:text-slate-100">
                                        {item.q}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body2" className="text-slate-500 dark:text-slate-400">
                                        {item.a}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>

                    <Box className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-slate-50 p-5 dark:border-slate-700/90 dark:bg-slate-800/50">
                        <Box>
                            <Typography variant="body1" className="font-semibold text-slate-900 dark:text-white">
                                {t('support.ask.h1')}
                            </Typography>
                            <Typography variant="body2" className="text-slate-500 dark:text-slate-400">
                                {t('support.ask.h2')}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={() => contactRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            sx={{
                                backgroundColor: '#4F46E5',
                                '&:hover': { backgroundColor: '#4338CA' },
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            {t('support.ask.btn')}
                        </Button>
                    </Box>

                    <Box
                        ref={contactRef}
                        className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-700/90 dark:bg-slate-900"
                    >
                        <Typography variant="h6" className="mb-5 font-semibold text-slate-900 dark:text-white">
                            {t('support.form.h1')}
                        </Typography>

                        {submitted && (
                            <Alert severity="success" onClose={() => setSubmitted(false)} className="mb-4">
                                {t('support.form.alert')}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit} noValidate className="space-y-4">

                            <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <TextField
                                    label={t('support.form.name')}
                                    value={form.name}
                                    onChange={handleChange('name')}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    fullWidth
                                    autoComplete="name"
                                    sx={inputStyle}
                                />
                                <TextField
                                    label={t('support.form.email')}
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange('email')}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    fullWidth
                                    autoComplete="email"
                                    sx={inputStyle}
                                />
                            </Box>

                            <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <SelectField
                                    label={t('support.form.role')}
                                    value={form.role}
                                    onChange={handleChange('role')}
                                    error={!!errors.role}
                                    helperText={errors.role}
                                    options={ROLE_OPTIONS}
                                />
                                <SelectField
                                    label={t('support.form.topic')}
                                    value={form.topic}
                                    onChange={handleChange('topic')}
                                    error={!!errors.topic}
                                    helperText={errors.topic}
                                    options={TOPIC_OPTIONS}
                                />
                            </Box>

                            <TextField
                                label={t('support.form.message')}
                                value={form.message}
                                onChange={handleChange('message')}
                                error={!!errors.message}
                                helperText={
                                    errors.message ?? (
                                        <span className="dark:text-slate-400">{charCount} / 600</span>
                                    )
                                }
                                multiline
                                minRows={4}
                                fullWidth
                                sx={inputStyle}
                            />

                            <Box className="flex gap-3 pt-1">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        backgroundColor: '#4F46E5',
                                        '&:hover': { backgroundColor: '#4338CA' },
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        paddingY: '10px',
                                    }}
                                >
                                    {t('support.form.send')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={handleReset}
                                    sx={{
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        borderColor: '#e2e8f0',
                                        color: '#64748b',
                                        '&:hover': { borderColor: '#94a3b8' },
                                    }}
                                >
                                    {t('support.form.clear')}
                                </Button>
                            </Box>

                        </Box>

                        <Typography variant="caption" className="mt-4 block text-center text-slate-400 dark:text-slate-500">

                            {t('support.form.link')}
                            <a href="mailto:support@meson.edu" className="text-indigo-500 hover:text-indigo-600 underline">support@meson.edu</a>
                        </Typography>

                    </Box>
                </Box>
            </Container>

            <Footer />
        </Box>
    )
}
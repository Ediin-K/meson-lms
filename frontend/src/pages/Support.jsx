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

const FAQ_ITEMS = [
    {
        q: 'Si e ndryshoj fjalëkalimin?',
        a: 'Shko te Cilësimet → Siguria → Ndrysho fjalëkalimin. Do të marrësh një email konfirmimi.',
    },
    {
        q: 'Si dorëzoj një detyrë?',
        a: 'Hyr në kurs → zgjidh detyrën → ngarko skedarin ose shkruaj përgjigjen → shtyp Dorëzo para afatit.',
    },
    {
        q: 'Nuk po më hapet kursi, çfarë bëj?',
        a: 'Provo me një shfletues tjetër ose pastro cache-in. Nëse problemi vazhdon, kontakto mësuesin ose na shkruaj.',
    },
    {
        q: 'Si shoh notën time?',
        a: "Shko te kursi → seksioni Notat. Notat shfaqen pasi mësuesi t'i vlerësojë punimet.",
    },
    {
        q: 'Si regjistrohem në një kurs të ri?',
        a: 'Shko te Kurset → Shfleto → gjej kursin dhe shtyp Regjistrohu. Disa kurse kërkojnë kod nga mësuesi.',
    },
    {
        q: 'Si kontaktoj mësuesin tim?',
        a: 'Hyr në kurs → shtyp butonin Mesazh pranë emrit të mësuesit, ose përdor seksionin Diskutimet.',
    },
]

const ROLE_OPTIONS = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Mësues / Instruktor' },
    { value: 'parent', label: 'Prind' },
    { value: 'admin', label: 'Administrator' },
]

const TOPIC_OPTIONS = [
    { value: 'access', label: 'Problem hyrje / llogarie' },
    { value: 'course', label: 'Pyetje për kurs' },
    { value: 'grade', label: 'Notim / vlerësim' },
    { value: 'technical', label: 'Problem teknik' },
    { value: 'billing', label: 'Pagesë / abonim' },
    { value: 'other', label: 'Tjetër' },
]

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const initialForm = {
    name: '',
    email: '',
    role: '',
    topic: '',
    message: '',
}

function validate(form) {
    const e = {}
    if (!form.name.trim()) e.name = 'E detyrueshme.'
    if (!isValidEmail(form.email)) e.email = 'Email i pavlefshëm.'
    if (!form.role) e.role = 'E detyrueshme.'
    if (!form.topic) e.topic = 'E detyrueshme.'
    if (form.message.trim().length < 15) e.message = 'Minimum 15 karaktere.'
    return e
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

    return (
        <Container maxWidth="md" className="!py-10">
            <Box className="space-y-8">

                <Box className="text-center">
                    <Typography variant="h5" className="font-bold text-slate-900 dark:text-white">
                        Si mund t'ju ndihmojmë?
                    </Typography>
                    <Typography variant="body2" className="mt-1 text-slate-500 dark:text-slate-400">
                        Gjeni përgjigjen në FAQ ose na dërgoni mesazh.
                    </Typography>
                </Box>

                <Box className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-700/90 dark:bg-slate-900">
                    <Typography variant="h6" className="mb-4 font-semibold text-slate-900 dark:text-white">
                        Pyetje të shpeshta
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
                            Nuk gjete përgjigjen?
                        </Typography>
                        <Typography variant="body2" className="text-slate-500 dark:text-slate-400">
                            Na shkruaj dhe t'ju përgjigjemi brenda 24 orëve.
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
                        Na shkruaj
                    </Button>
                </Box>

                <Box
                    ref={contactRef}
                    className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-700/90 dark:bg-slate-900"
                >
                    <Typography variant="h6" className="mb-5 font-semibold text-slate-900 dark:text-white">
                        Dërgo një mesazh
                    </Typography>

                    {submitted && (
                        <Alert severity="success" onClose={() => setSubmitted(false)} className="mb-4">
                            Mesazhi u dërgua. Do t'ju kthejmë përgjigje së shpejti.
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate className="space-y-4">

                        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <TextField
                                label="Emri i plotë"
                                value={form.name}
                                onChange={handleChange('name')}
                                error={!!errors.name}
                                helperText={errors.name}
                                fullWidth
                                autoComplete="name"
                                sx={inputStyle}
                            />
                            <TextField
                                label="Adresa e emailit"
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
                                label="Roli juaj"
                                value={form.role}
                                onChange={handleChange('role')}
                                error={!!errors.role}
                                helperText={errors.role}
                                options={ROLE_OPTIONS}
                            />
                            <SelectField
                                label="Tema e mesazhit"
                                value={form.topic}
                                onChange={handleChange('topic')}
                                error={!!errors.topic}
                                helperText={errors.topic}
                                options={TOPIC_OPTIONS}
                            />
                        </Box>

                        <TextField
                            label="Mesazhi"
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
                                Dërgo mesazhin
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
                                Pastro
                            </Button>
                        </Box>

                    </Box>

                    <Typography variant="caption" className="mt-4 block text-center text-slate-400 dark:text-slate-500">
                        Mund të na gjeni edhe në{' '}
                        <span className="text-indigo-500">support@meson.edu</span>
                    </Typography>
                </Box>

            </Box>
        </Container>
    )
}
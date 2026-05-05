import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPreferences } from '../context/appPreferencesContext'
import {
    Typography, Container, Box, Card, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Chip, Avatar, CircularProgress
} from '@mui/material'
import SearchRounded from '@mui/icons-material/SearchRounded'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import HourglassTopRounded from '@mui/icons-material/HourglassTopRounded'
import BlockRounded from '@mui/icons-material/BlockRounded'
import Footer from '../components/ui/Footer'

const STATUS_CONFIG = {
    active:    { label: 'Aktiv',      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: HourglassTopRounded },
    completed: { label: 'Përfunduar', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',                 icon: CheckCircleRounded },
    dropped:   { label: 'Braktisur',  color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',             icon: BlockRounded },
}

export default function AdminEnrollments() {
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    // TODO: replace with API call
    const [enrollments] = useState([])
    const [loading]     = useState(false)
    const [searchTerm, setSearchTerm]     = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    const filtered = enrollments.filter(e => {
        const matchSearch =
            (e.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (e.courseName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        const matchStatus = filterStatus === 'all' || e.status === filterStatus
        return matchSearch && matchStatus
    })

    const counts = {
        all:       enrollments.length,
        active:    enrollments.filter(e => e.status === 'active').length,
        completed: enrollments.filter(e => e.status === 'completed').length,
        dropped:   enrollments.filter(e => e.status === 'dropped').length,
    }

    const FILTERS = [
        { key: 'all',       label: `Të gjitha (${counts.all})` },
        { key: 'active',    label: `Aktive (${counts.active})` },
        { key: 'completed', label: `Përfunduara (${counts.completed})` },
        { key: 'dropped',   label: `Braktisura (${counts.dropped})` },
    ]

    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="lg" className="flex-grow py-8 mt-4 sm:mt-8">
                <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/admin')} className="!mb-6 !normal-case !text-slate-600 dark:!text-slate-400">
                    {t('home.admin.services.backToPanel', 'Kthehu te Paneli')}
                </Button>

                <Box className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <Box className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                                <AssignmentRounded className="text-rose-600 !text-xl" />
                            </div>
                            <Typography variant="h4" component="h1" className="!font-extrabold !text-slate-900 dark:!text-white">
                                {t('home.admin.services.enrollments.title', 'Regjistrimet')}
                            </Typography>
                        </Box>
                        <Typography variant="body1" className="!text-slate-600 dark:!text-slate-400">
                            {t('home.admin.services.enrollments.desc', 'Shikoni dhe menaxhoni regjistrimet e studentëve.')}
                        </Typography>
                    </div>
                    <TextField
                        placeholder="Kërko student ose kurs..."
                        variant="outlined" size="small" value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-72"
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded className="text-slate-400" /></InputAdornment> }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                </Box>

                {/* STATUS FILTERS */}
                <Box className="flex flex-wrap gap-2 mb-6">
                    {FILTERS.map(({ key, label }) => (
                        <button key={key} onClick={() => setFilterStatus(key)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                                filterStatus === key
                                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-400'
                            }`}>
                            {label}
                        </button>
                    ))}
                </Box>

                <Card elevation={0} className="rounded-3xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
                    {loading ? (
                        <Box className="flex justify-center py-24"><CircularProgress className="!text-rose-500" /></Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead className="bg-slate-50 dark:!bg-slate-800/80">
                                    <TableRow>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Studenti</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Kursi</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Semestri</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Regjistruar më</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Statusi</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <Box className="flex flex-col items-center justify-center py-20 gap-4">
                                                    <div className="h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                                                        <AssignmentOutlinedIcon className="!text-4xl text-rose-400" />
                                                    </div>
                                                    <Typography className="!font-semibold !text-slate-500">Nuk ka regjistrime akoma.</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map((enr) => {
                                        const cfg = STATUS_CONFIG[enr.status] || STATUS_CONFIG.active
                                        const Icon = cfg.icon
                                        return (
                                            <TableRow key={enr.id} hover>
                                                <TableCell>
                                                    <Box className="flex items-center gap-3">
                                                        <Avatar className="!w-9 !h-9 !text-sm !bg-gradient-to-br from-rose-500 to-pink-600 !font-bold">
                                                            {enr.studentName?.charAt(0)}
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{enr.studentName}</p>
                                                            <p className="text-xs text-slate-500">{enr.studentEmail}</p>
                                                        </div>
                                                    </Box>
                                                </TableCell>
                                                <TableCell className="!text-slate-700 dark:!text-slate-300 !font-medium max-w-[200px]">
                                                    <p className="truncate">{enr.courseName}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={`Sem. ${enr.semester}`} size="small" className="!bg-slate-100 dark:!bg-slate-800 !text-slate-600 !font-semibold" />
                                                </TableCell>
                                                <TableCell className="!text-slate-500 !text-sm">{enr.enrolledAt}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                                                        <Icon className="!text-sm" />{cfg.label}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Card>
            </Container>
            <Footer />
        </section>
    )
}

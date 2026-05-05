import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPreferences } from '../context/appPreferencesContext'
import {
    Typography, Container, Box, Card, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Avatar, IconButton, CircularProgress
} from '@mui/material'
import SearchRounded from '@mui/icons-material/SearchRounded'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import DownloadRounded from '@mui/icons-material/DownloadRounded'
import VerifiedRounded from '@mui/icons-material/VerifiedRounded'
import PendingRounded from '@mui/icons-material/PendingRounded'
import Footer from '../components/ui/Footer'

export default function AdminCertificates() {
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    // TODO: replace with API call
    const [certificates] = useState([])
    const [loading]      = useState(false)
    const [searchTerm, setSearchTerm]     = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    const filtered = certificates.filter(c => {
        const matchSearch =
            (c.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (c.courseName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (c.certCode?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        const matchStatus = filterStatus === 'all' || c.status === filterStatus
        return matchSearch && matchStatus
    })

    const issued  = certificates.filter(c => c.status === 'issued').length
    const pending = certificates.filter(c => c.status === 'pending').length

    const FILTERS = [
        { key: 'all',     label: `Të gjitha (${certificates.length})`, active: 'bg-emerald-600' },
        { key: 'issued',  label: `Lëshuara (${issued})`,               active: 'bg-emerald-600' },
        { key: 'pending', label: `Në pritje (${pending})`,             active: 'bg-amber-500'   },
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
                            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                <WorkspacePremiumRounded className="text-emerald-600 !text-xl" />
                            </div>
                            <Typography variant="h4" component="h1" className="!font-extrabold !text-slate-900 dark:!text-white">
                                {t('home.admin.services.certificates.title', 'Certifikatat')}
                            </Typography>
                        </Box>
                        <Typography variant="body1" className="!text-slate-600 dark:!text-slate-400">
                            {t('home.admin.services.certificates.desc', 'Menaxho lëshimin e certifikatave dhe arritjet e studentëve.')}
                        </Typography>
                    </div>
                    <TextField
                        placeholder="Kërko student, kurs ose kod..."
                        variant="outlined" size="small" value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-72"
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded className="text-slate-400" /></InputAdornment> }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                </Box>

                {/* FILTERS */}
                <Box className="flex flex-wrap gap-2 mb-6">
                    {FILTERS.map(({ key, label, active }) => (
                        <button key={key} onClick={() => setFilterStatus(key)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                                filterStatus === key
                                    ? `${active} text-white shadow-md`
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                            }`}>
                            {label}
                        </button>
                    ))}
                </Box>

                <Card elevation={0} className="rounded-3xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
                    {loading ? (
                        <Box className="flex justify-center py-24"><CircularProgress className="!text-emerald-500" /></Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead className="bg-slate-50 dark:!bg-slate-800/80">
                                    <TableRow>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Studenti</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Kursi</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Nota</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Kodi</TableCell>
                                        <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">Statusi</TableCell>
                                        <TableCell align="right" className="!font-bold !text-slate-700 dark:!text-slate-200">Veprime</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <Box className="flex flex-col items-center justify-center py-20 gap-4">
                                                    <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                                        <WorkspacePremiumOutlinedIcon className="!text-4xl text-emerald-400" />
                                                    </div>
                                                    <Typography className="!font-semibold !text-slate-500">Nuk ka certifikata akoma.</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map((cert) => (
                                        <TableRow key={cert.id} hover>
                                            <TableCell>
                                                <Box className="flex items-center gap-3">
                                                    <Avatar className="!w-9 !h-9 !text-sm !bg-gradient-to-br from-emerald-500 to-teal-600 !font-bold">
                                                        {cert.studentName?.charAt(0)}
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{cert.studentName}</p>
                                                        <p className="text-xs text-slate-500">{cert.studentEmail}</p>
                                                    </div>
                                                </Box>
                                            </TableCell>
                                            <TableCell className="!text-slate-700 dark:!text-slate-300 max-w-[180px]">
                                                <p className="truncate text-sm font-medium">{cert.courseName}</p>
                                            </TableCell>
                                            <TableCell>
                                                {cert.grade != null ? (
                                                    <span className={`font-bold text-lg ${cert.grade >= 9 ? 'text-emerald-600' : cert.grade >= 7 ? 'text-sky-600' : 'text-amber-600'}`}>
                                                        {cert.grade}
                                                    </span>
                                                ) : <span className="text-slate-400 text-sm">—</span>}
                                            </TableCell>
                                            <TableCell>
                                                {cert.certCode
                                                    ? <code className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg font-semibold">{cert.certCode}</code>
                                                    : <span className="text-slate-400 text-sm">—</span>}
                                            </TableCell>
                                            <TableCell>
                                                {cert.status === 'issued' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                        <VerifiedRounded className="!text-sm" /> Lëshuar
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                                        <PendingRounded className="!text-sm" /> Në pritje
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                {cert.status === 'issued'
                                                    ? <IconButton size="small" className="!text-slate-400 hover:!text-emerald-600"><DownloadRounded fontSize="small" /></IconButton>
                                                    : <Button size="small" variant="outlined" className="!rounded-lg !normal-case !text-xs !font-bold !border-amber-400 !text-amber-600 hover:!bg-amber-50">Lësho</Button>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
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

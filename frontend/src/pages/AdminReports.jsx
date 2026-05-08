import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPreferences } from '../context/appPreferencesContext'
import {
    Typography, Container, Box, Card, CardContent, Grid, Button, CircularProgress
} from '@mui/material'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import AnalyticsRounded from '@mui/icons-material/AnalyticsRounded'
import PeopleOutlineRounded from '@mui/icons-material/PeopleOutlineRounded'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded'
import Footer from '../components/ui/Footer'

// Stat card skeleton — shows when no backend data yet
function StatCard({ label, icon: Icon, color, bg }) {
    return (
        <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 shadow-sm">
            <CardContent className="!p-5">
                <Box className="flex items-start justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                        <Icon className={`${color} !text-xl`} />
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center gap-0.5">
                        <TrendingUpRounded className="!text-xs" /> —
                    </span>
                </Box>
                <div className="h-7 w-20 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse mb-1" />
                <Typography variant="caption" className="!text-slate-500 !font-medium">{label}</Typography>
            </CardContent>
        </Card>
    )
}

const STAT_CARDS = [
    { label: 'Përdorues Aktivë',     icon: PeopleOutlineRounded,         color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
    { label: 'Kurse Aktive',         icon: SchoolOutlinedIcon,            color: 'text-sky-600',    bg: 'bg-sky-100 dark:bg-sky-900/40' },
    { label: 'Regjistrime Totale',   icon: AssignmentOutlinedIcon,        color: 'text-rose-600',   bg: 'bg-rose-100 dark:bg-rose-900/40' },
    { label: 'Certifikata Lëshuara', icon: WorkspacePremiumOutlinedIcon,  color: 'text-emerald-600',bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
]

export default function AdminReports() {
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    // TODO: replace with API call
    const [stats]       = useState(null)   // will be { totalUsers, totalCourses, totalEnrollments, totalCertificates, activityByMonth: [], topCourses: [] }
    const [loading]     = useState(false)
    const [activeTab, setActiveTab] = useState('overview')

    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="lg" className="flex-grow py-8 mt-4 sm:mt-8">
                <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/admin')} className="!mb-6 !normal-case !text-slate-600 dark:!text-slate-400">
                    {t('home.admin.services.backToPanel', 'Kthehu te Paneli')}
                </Button>

                {/* HEADER */}
                <Box className="mb-8">
                    <Box className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                            <AnalyticsRounded className="text-violet-600 !text-xl" />
                        </div>
                        <Typography variant="h4" component="h1" className="!font-extrabold !text-slate-900 dark:!text-white">
                            {t('home.admin.services.reports.title', 'Raportet')}
                        </Typography>
                    </Box>
                    <Typography variant="body1" className="!text-slate-600 dark:!text-slate-400">
                        {t('home.admin.services.reports.desc', 'Statistika të detajuara mbi performancën e platformës.')}
                    </Typography>
                </Box>

                {/* TAB NAV */}
                <Box className="flex gap-2 mb-8 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-fit">
                    {[
                        { key: 'overview', label: 'Pasqyrë' },
                        { key: 'users',    label: 'Përdoruesit' },
                        { key: 'courses',  label: 'Kurset' },
                    ].map(({ key, label }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                                activeTab === key
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}>
                            {label}
                        </button>
                    ))}
                </Box>

                {loading ? (
                    <Box className="flex justify-center py-24"><CircularProgress className="!text-violet-500" /></Box>
                ) : (
                    <>
                        {/* STAT CARDS — skeletons until data arrives */}
                        <Grid container spacing={3} className="mb-8">
                            {STAT_CARDS.map((card) => (
                                <Grid item xs={12} sm={6} md={3} key={card.label}>
                                    <StatCard {...card} value={stats?.[card.key]} />
                                </Grid>
                            ))}
                        </Grid>

                        {/* CHART PLACEHOLDER */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={7}>
                                <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 shadow-sm h-full">
                                    <CardContent className="!p-6">
                                        <Typography variant="h6" className="!font-bold !text-slate-900 dark:!text-white !mb-1">
                                            Aktiviteti i Përdoruesve
                                        </Typography>
                                        <Typography variant="caption" className="!text-slate-500">Numri i përdoruesve aktivë sipas muajit</Typography>
                                        {/* TODO: render chart from stats.activityByMonth */}
                                        <Box className="flex items-end gap-3 mt-6 h-40">
                                            {['Jan','Shk','Mar','Pri','Maj','Qer'].map((m) => (
                                                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                                                    <div className="w-full rounded-t-lg bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ height: `${Math.random() * 60 + 20}%` }} />
                                                    <span className="text-xs text-slate-400 font-semibold">{m}</span>
                                                </div>
                                            ))}
                                        </Box>
                                        <p className="text-xs text-slate-400 text-center mt-3">Të dhënat do të shfaqen pas lidhjes me API</p>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* TOP COURSES PLACEHOLDER */}
                            <Grid item xs={12} md={5}>
                                <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 shadow-sm h-full">
                                    <CardContent className="!p-6">
                                        <Typography variant="h6" className="!font-bold !text-slate-900 dark:!text-white !mb-1">
                                            Kurset Kryesore
                                        </Typography>
                                        <Typography variant="caption" className="!text-slate-500">Sipas numrit të studentëve</Typography>
                                        {/* TODO: render from stats.topCourses */}
                                        <Box className="flex flex-col gap-4 mt-5">
                                            {[1,2,3,4,5].map((i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <span className="text-sm font-black text-slate-300 w-6">#{i}</span>
                                                    <div className="flex-1">
                                                        <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse mb-2" style={{ width: `${100 - i * 12}%` }} />
                                                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ width: `${80 - i * 8}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </Box>
                                        <p className="text-xs text-slate-400 text-center mt-4">Të dhënat do të shfaqen pas lidhjes me API</p>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Container>
            <Footer />
        </section>
    )
}

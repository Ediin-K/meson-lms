import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { useAppPreferences } from '../../context/appPreferencesContext'
import {
    Typography, Box, Card, CardContent, CircularProgress, Container, Grid
} from '@mui/material'
import PeopleRounded from '@mui/icons-material/PeopleRounded'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'
import CategoryRounded from '@mui/icons-material/CategoryRounded'
import AnalyticsRounded from '@mui/icons-material/AnalyticsRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import Footer from '../ui/Footer'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axiosInstance.get('/admin/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const adminServices = [
        {
            title: t('home.admin.services.users.title'),
            desc: t('home.admin.services.users.desc'),
            icon: PeopleRounded,
            path: '/admin/users',
            color: 'text-indigo-600',
            bg: 'bg-indigo-100 dark:bg-indigo-900/40'
        },
        {
            title: t('home.admin.services.courses.title'),
            desc: t('home.admin.services.courses.desc'),
            icon: SchoolRounded,
            path: '/admin/courses',
            color: 'text-sky-600',
            bg: 'bg-sky-100 dark:bg-sky-900/40'
        },
        {
            title: t('home.admin.services.categories.title'),
            desc: t('home.admin.services.categories.desc'),
            icon: CategoryRounded,
            path: '/admin/categories',
            color: 'text-amber-600',
            bg: 'bg-amber-100 dark:bg-amber-900/40'
        },
        {
            title: t('home.admin.services.enrollments.title'),
            desc: t('home.admin.services.enrollments.desc'),
            icon: AssignmentRounded,
            path: '/admin/enrollments',
            color: 'text-rose-600',
            bg: 'bg-rose-100 dark:bg-rose-900/40'
        },
        {
            title: t('home.admin.services.certificates.title'),
            desc: t('home.admin.services.certificates.desc'),
            icon: WorkspacePremiumRounded,
            path: '/admin/certificates',
            color: 'text-emerald-600',
            bg: 'bg-emerald-100 dark:bg-emerald-900/40'
        },
        {
            title: t('home.admin.services.reports.title'),
            desc: t('home.admin.services.reports.desc'),
            icon: AnalyticsRounded,
            path: '/admin/reports',
            color: 'text-violet-600',
            bg: 'bg-violet-100 dark:bg-violet-900/40'
        }
    ]

    return (
        <Container maxWidth="lg" className="py-8 mt-4 sm:mt-8">
            <section className="mb-6 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl shadow-slate-200/20 sm:p-10 dark:!border-slate-700/60 dark:!bg-slate-900/50 dark:shadow-none">

                {/* HEADER */}
                <Typography variant="overline" className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400">
                    {t('home.admin.overline')}
                </Typography>
                <Typography variant="h3" component="h1" className="!mt-1 !font-extrabold !text-slate-900 dark:!text-white">
                    {t('home.admin.title')}
                </Typography>
                <Typography variant="body1" className="!mt-3 !max-w-2xl !text-slate-600 dark:!text-slate-400 text-lg">
                    {t('home.admin.body')}
                </Typography>

                {/* STATS STRIP */}
                {!loading && stats && (
                    <Box className="mt-8 flex flex-wrap gap-8 p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                        <div className="flex-1 min-w-[140px]">
                            <Typography variant="caption" className="!text-slate-500 !uppercase !font-bold !tracking-widest">
                                {t('home.admin.stats.users')}
                            </Typography>
                            <Typography variant="h4" className="!font-black dark:!text-white">{stats.totalUsers}</Typography>
                        </div>
                        <div className="w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />
                        <div className="flex-1 min-w-[140px]">
                            <Typography variant="caption" className="!text-slate-500 !uppercase !font-bold !tracking-widest">
                                {t('home.admin.stats.courses')}
                            </Typography>
                            <Typography variant="h4" className="!font-black dark:!text-white">{stats.totalCourses}</Typography>
                        </div>
                        <div className="w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />
                        <div className="flex-1 min-w-[140px]">
                            <Typography variant="caption" className="!text-slate-500 !uppercase !font-bold !tracking-widest">
                                {t('home.admin.stats.enrollments')}
                            </Typography>
                            <Typography variant="h4" className="!font-black dark:!text-white">{stats.totalEnrollments}</Typography>
                        </div>
                    </Box>
                )}

                {/* SERVICES GRID */}
                <Grid container spacing={3} className="mt-10">
                    {adminServices.map((service) => (
                        <Grid item xs={12} sm={6} md={4} key={service.title}>
                            <Card 
                                elevation={0}
                                className="h-full rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/40 dark:!border-slate-700/80 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/10 group cursor-pointer"
                                onClick={() => navigate(service.path)}
                            >
                                <CardContent className="!p-6 flex flex-col h-full">
                                    <div className={`h-14 w-14 rounded-2xl ${service.bg} flex items-center justify-center mb-5 transition-transform group-hover:scale-110 shadow-sm`}>
                                        <service.icon className={`${service.color} !text-3xl`} />
                                    </div>
                                    <Typography variant="h6" className="!font-bold !text-slate-900 dark:!text-white mb-2">
                                        {service.title}
                                    </Typography>
                                    <Typography variant="body2" className="!text-slate-500 dark:!text-slate-400 mb-6 flex-grow leading-relaxed">
                                        {service.desc}
                                    </Typography>
                                    <Box className="flex items-center text-sky-600 dark:text-sky-400 font-bold text-sm">
                                        {t('home.admin.services.enter')}
                                        <ArrowForwardRounded className="ml-1 !text-lg transition-transform group-hover:translate-x-1" />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <div className="mt-16">
                    <Footer />
                </div>
            </section>
        </Container>
    )
}
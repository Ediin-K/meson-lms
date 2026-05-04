import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { useAppPreferences } from '../../context/appPreferencesContext'
import {
    Typography, Box, Card, CardContent, CircularProgress, Button
} from '@mui/material'
import PeopleRounded from '@mui/icons-material/PeopleRounded'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'
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

    const statCards = stats ? [
        {
            label: 'Përdorues',
            value: stats.totalUsers,
            icon: PeopleRounded,
            color: 'text-sky-600',
            bg: 'bg-sky-100 dark:bg-sky-900/50',
            href: '/admin/users'
        },
        {
            label: 'Kurse',
            value: stats.totalCourses,
            icon: SchoolRounded,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100 dark:bg-indigo-900/50',
            href: '/admin/courses'
        },
        {
            label: 'Regjistrimet',
            value: stats.totalEnrollments,
            icon: AssignmentRounded,
            color: 'text-amber-600',
            bg: 'bg-amber-100 dark:bg-amber-900/50',
            href: '/admin/enrollments'
        },
        {
            label: 'Certifikata',
            value: stats.totalCertificates,
            icon: WorkspacePremiumRounded,
            color: 'text-green-600',
            bg: 'bg-green-100 dark:bg-green-900/50',
            href: '/admin/certificates'
        },
    ] : []

    const quickActions = [
        { label: 'Menaxho Kurset', href: '/admin/courses', color: '!bg-sky-600' },
        { label: 'Menaxho Përdoruesit', href: '/admin/users', color: '!bg-indigo-600' },
        { label: 'Menaxho Kategoritë', href: '/admin/categories', color: '!bg-amber-600' },
    ]

    return (
        <section className="mb-6 rounded-2xl border border-sky-200/60 bg-white/90 p-4 shadow-sm ring-1 ring-sky-100/50 sm:p-6 dark:!border-slate-700/60 dark:!bg-slate-900/85 dark:!ring-slate-600/50">

            {/* HEADER */}
            <Typography variant="overline" className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400">
                {t('home.admin.overline')}
            </Typography>
            <Typography variant="h5" component="h2" className="!mt-1 !font-bold !text-slate-800 dark:!text-white">
                {t('home.admin.title')}
            </Typography>
            <Typography variant="body2" className="!mt-1 !text-slate-600 dark:!text-slate-400">
                {t('home.admin.body')}
            </Typography>

            {/* STATS */}
            {loading ? (
                <Box className="flex justify-center py-12">
                    <CircularProgress className="!text-sky-500" />
                </Box>
            ) : (
                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
                        <Card
                            key={label}
                            elevation={0}
                            className="rounded-2xl border border-slate-200/80 dark:!border-slate-700/80 cursor-pointer hover:-translate-y-1 transition-transform duration-200"
                            onClick={() => navigate(href)}
                        >
                            <CardContent className="!p-5">
                                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} mb-3`}>
                                    <Icon className={color} />
                                </div>
                                <Typography variant="h4" className="!font-extrabold !text-slate-900 dark:!text-white">
                                    {value}
                                </Typography>
                                <Typography variant="body2" className="!text-slate-500 dark:!text-slate-400 !mt-0.5">
                                    {label}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* QUICK ACTIONS */}
            <Box className="mt-8">
                <Typography variant="subtitle1" className="!font-bold !text-slate-800 dark:!text-white !mb-4">
                    Veprime të shpejta
                </Typography>
                <div className="grid gap-3 sm:grid-cols-3">
                    {quickActions.map(({ label, href, color }) => (
                        <Button
                            key={label}
                            variant="contained"
                            endIcon={<ArrowForwardRounded />}
                            onClick={() => navigate(href)}
                            className={`!normal-case !rounded-2xl !py-3 !font-semibold ${color}`}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </Box>

            <Footer />
        </section>
    )
}
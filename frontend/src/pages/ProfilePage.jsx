import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'
import { useAppPreferences } from '../context/appPreferencesContext'
import Footer from '../components/ui/Footer'
import {
    Typography, Container, Box, CircularProgress, Card, CardContent, Chip, Button
} from '@mui/material'
import PersonRounded from '@mui/icons-material/PersonRounded'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'
import PlayCircleFilledRounded from '@mui/icons-material/PlayCircleFilledRounded'

export default function ProfilePage() {
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    const userId = localStorage.getItem('userId')

    const [enrollments, setEnrollments] = useState([])
    const [certificates, setCertificates] = useState([])
    const [loading, setLoading] = useState(true)

    const email = localStorage.getItem('email') || '—'
    const role = localStorage.getItem('meson-role') || '—'

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [enrollmentsRes, certificatesRes] = await Promise.all([
                    axiosInstance.get(`/enrollments/user/${userId}`),
                    axiosInstance.get(`/certificates/user/${userId}`)
                ])
                setEnrollments(enrollmentsRes.data)
                setCertificates(certificatesRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [userId])

    if (loading) {
        return (
            <Box className="flex justify-center items-center py-24">
                <CircularProgress className="!text-sky-500" />
            </Box>
        )
    }

    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="lg" className="flex-grow py-8 px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">

                {/* HEADER */}
                <Box className="mb-10">
                    <Typography variant="overline" className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400">
                        Profili
                    </Typography>
                    <Typography variant="h3" component="h1" className="!mt-1 !font-extrabold !text-slate-900 dark:!text-white">
                        Llogaria ime
                    </Typography>
                </Box>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* SIDEBAR — info personale */}
                    <div className="lg:col-span-1">
                        <Card elevation={0} className="rounded-2xl border border-slate-200/80 dark:!border-slate-700/80">
                            <CardContent className="!p-6">
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/50 mb-4">
                                        <PersonRounded className="!text-4xl text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <Chip
                                        label={role}
                                        size="small"
                                        color="primary"
                                        className="!font-bold !capitalize"
                                    />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <Typography variant="caption" className="!text-slate-500 dark:!text-slate-400 !font-semibold !uppercase !tracking-wider">
                                            Email
                                        </Typography>
                                        <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white !mt-0.5">
                                            {email}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" className="!text-slate-500 dark:!text-slate-400 !font-semibold !uppercase !tracking-wider">
                                            Kurse të regjistruara
                                        </Typography>
                                        <Typography variant="h5" className="!font-extrabold !text-sky-600 dark:!text-sky-400 !mt-0.5">
                                            {enrollments.length}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" className="!text-slate-500 dark:!text-slate-400 !font-semibold !uppercase !tracking-wider">
                                            Certifikata
                                        </Typography>
                                        <Typography variant="h5" className="!font-extrabold !text-green-600 dark:!text-green-400 !mt-0.5">
                                            {certificates.length}
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* CONTENT */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* ENROLLMENTS */}
                        <Card elevation={0} className="rounded-2xl border border-slate-200/80 dark:!border-slate-700/80">
                            <CardContent className="!p-6">
                                <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white !mb-4 flex items-center gap-2">
                                    <SchoolRounded className="text-sky-600" fontSize="small" />
                                    Kurset e mia
                                </Typography>

                                {enrollments.length === 0 ? (
                                    <Typography variant="body2" className="!text-slate-500">
                                        Nuk je i regjistruar në asnjë kurs
                                    </Typography>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {enrollments.map(enrollment => (
                                            <Box
                                                key={enrollment.id}
                                                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-sky-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                                onClick={() => navigate(`/course/${enrollment.courseId}`)}
                                            >
                                                <div>
                                                    <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                                                        {enrollment.courseTitulli}
                                                    </Typography>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Chip
                                                            label={enrollment.statusi}
                                                            size="small"
                                                            color={enrollment.statusi === 'AKTIV' ? 'success' : enrollment.statusi === 'PERFUNDUAR' ? 'primary' : 'default'}
                                                            className="!text-xs !font-bold"
                                                        />
                                                        <Typography variant="caption" className="!text-slate-500">
                                                            {new Date(enrollment.dataRegjistrimit).toLocaleDateString()}
                                                        </Typography>
                                                    </div>
                                                </div>
                                                <PlayCircleFilledRounded className="text-sky-500" fontSize="small" />
                                            </Box>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* CERTIFICATES */}
                        <Card elevation={0} className="rounded-2xl border border-slate-200/80 dark:!border-slate-700/80">
                            <CardContent className="!p-6">
                                <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white !mb-4 flex items-center gap-2">
                                    <WorkspacePremiumRounded className="text-green-600" fontSize="small" />
                                    Certifikatat e mia
                                </Typography>

                                {certificates.length === 0 ? (
                                    <Typography variant="body2" className="!text-slate-500">
                                        Nuk ke asnjë certifikatë ende
                                    </Typography>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {certificates.map(cert => (
                                            <Box
                                                key={cert.id}
                                                className="p-4 rounded-xl border border-green-100 dark:border-green-900/40 bg-green-50/50 dark:bg-green-900/10"
                                            >
                                                <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                                                    {cert.courseTitulli}
                                                </Typography>
                                                <Typography variant="caption" className="!text-slate-500 !block !mt-1">
                                                    Lëshuar: {new Date(cert.dataLeshimit).toLocaleDateString()}
                                                </Typography>
                                                <Typography variant="caption" className="!text-green-600 dark:!text-green-400 !block !mt-1 !font-mono">
                                                    #{cert.kodiUnik}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>
            <Footer />
        </section>
    )
}
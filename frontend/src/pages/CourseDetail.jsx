import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axiosInstance from '../services/axiosInstance'
import { useAppPreferences } from '../context/appPreferencesContext'
import Footer from '../components/ui/Footer'
import {
    Typography, Container, Box, Button, CircularProgress, Card, CardContent
} from '@mui/material'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import LibraryBooksRounded from '@mui/icons-material/LibraryBooksRounded'
import PlayCircleFilledRounded from '@mui/icons-material/PlayCircleFilledRounded'
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import ExpandLessRounded from '@mui/icons-material/ExpandLessRounded'
import LockRounded from '@mui/icons-material/LockRounded'

export default function CourseDetail() {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    const [course, setCourse] = useState(null)
    const [modules, setModules] = useState([])
    const [lessons, setLessons] = useState({})
    const [expandedModule, setExpandedModule] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [enrolling, setEnrolling] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [enrollmentKey, setEnrollmentKey] = useState('')
    const [enrollError, setEnrollError] = useState('')
    const userId = localStorage.getItem('userId')

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [courseRes, modulesRes, enrollmentRes] = await Promise.all([
                    axiosInstance.get(`/courses/${courseId}`),
                    axiosInstance.get(`/courses/${courseId}/modules`),
                    axiosInstance.get(`/enrollments/user/${userId}`)
                ])
                setCourse(courseRes.data)
                setModules(modulesRes.data)
                const enrolled = enrollmentRes.data.some(e => e.courseId === Number(courseId))
                setIsEnrolled(enrolled)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [courseId, userId])

    const handleEnroll = async () => {
        try {
            setEnrolling(true)
            setEnrollError('')
            await axiosInstance.post('/enrollments', {
                userId: Number(userId),
                courseId: Number(courseId),
                enrollmentKey: enrollmentKey
            })
            setIsEnrolled(true)
            setShowModal(false)
        } catch (err) {
            setEnrollError('Kodi i regjistrimit është i gabuar')
        } finally {
            setEnrolling(false)
        }
    }

    const toggleModule = async (moduleId) => {
        if (!isEnrolled) return
        if (expandedModule === moduleId) {
            setExpandedModule(null)
            return
        }
        setExpandedModule(moduleId)
        if (!lessons[moduleId]) {
            try {
                const res = await axiosInstance.get(`/modules/${moduleId}/lessons`)
                setLessons(prev => ({ ...prev, [moduleId]: res.data }))
            } catch (err) {
                console.error(err)
            }
        }
    }

    if (loading) {
        return (
            <Box className="flex justify-center items-center py-24">
                <CircularProgress className="!text-sky-500" />
            </Box>
        )
    }

    if (!course) {
        return (
            <Container maxWidth="lg" sx={{ mt: 6 }}>
                <Typography variant="h5" className="!text-slate-800 dark:!text-white">
                    {t('course.notFound')}
                </Typography>
                <Button
                    startIcon={<ArrowBackRounded />}
                    onClick={() => navigate(-1)}
                    className="!mt-4 !normal-case !text-sky-600"
                >
                    {t('course.backToHome')}
                </Button>
            </Container>
        )
    }

    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="lg" className="flex-grow py-8 px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">

                {/* BACK */}
                <Button
                    startIcon={<ArrowBackRounded />}
                    onClick={() => navigate(-1)}
                    className="!mb-8 !normal-case !text-slate-600 dark:!text-slate-400 hover:!bg-sky-50 dark:hover:!bg-slate-800 !rounded-full !px-4 !py-2"
                >
                    {t('course.backToSubjects')}
                </Button>

                {/* HEADER */}
                <Box className="mb-8">
                    <Typography variant="overline" className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400">
                        {course.categoryName}
                    </Typography>
                    <Typography variant="h3" component="h1" className="!mt-1 !font-extrabold !text-slate-900 dark:!text-white">
                        {course.titulli}
                    </Typography>
                    <Typography variant="body1" className="!mt-3 !max-w-2xl !text-slate-600 dark:!text-slate-400">
                        {course.pershkrimi}
                    </Typography>
                    <div className="mt-4 flex flex-wrap gap-4">
                        <span className="text-sm font-semibold text-sky-700 dark:text-sky-400">
                            👨‍🏫 {course.teacherName}
                        </span>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            📚 Semestri {course.semester}
                        </span>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            📊 {course.niveli}
                        </span>
                    </div>
                </Box>

                {/* ENROLLMENT BANNER */}
                {!isEnrolled && (
                    <Card elevation={0} className="rounded-2xl border border-amber-200/80 bg-amber-50/50 dark:!border-amber-700/40 dark:!bg-amber-900/10 mb-6">
                        <CardContent className="!p-5 flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <Typography variant="subtitle1" className="!font-bold !text-amber-800 dark:!text-amber-300">
                                    Nuk je i regjistruar në këtë kurs
                                </Typography>
                                <Typography variant="body2" className="!text-amber-700 dark:!text-amber-400">
                                    Fut kodin e regjistrimit për të pasur qasje
                                </Typography>
                            </div>
                            <Button
                                variant="contained"
                                onClick={() => setShowModal(true)}
                                className="!normal-case !rounded-full !bg-amber-500 hover:!bg-amber-600 !px-6"
                            >
                                Regjistrohu
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* MODULES */}
                {!isEnrolled ? (
                    <Box className="flex flex-col justify-center items-center py-20 px-4 text-center bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <LockRounded className="!text-6xl text-slate-300 dark:text-slate-600 mb-4" />
                        <Typography variant="h6" className="!font-bold !text-slate-800 dark:!text-slate-200">
                            Regjistrohu për të parë modulet
                        </Typography>
                        <Typography variant="body2" className="!mt-2 !text-slate-500 dark:!text-slate-400">
                            Fut kodin e regjistrimit për të pasur qasje në përmbajtje
                        </Typography>
                    </Box>
                ) : modules.length === 0 ? (
                    <Box className="flex flex-col justify-center items-center py-20 px-4 text-center bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <LibraryBooksRounded className="!text-6xl text-slate-300 dark:text-slate-600 mb-4" />
                        <Typography variant="h6" className="!font-bold !text-slate-800 dark:!text-slate-200">
                            Nuk ka module në këtë kurs
                        </Typography>
                    </Box>
                ) : (
                    <div className="flex flex-col gap-4">
                        {modules.map((module, index) => (
                            <Card
                                key={module.id}
                                elevation={0}
                                className="rounded-2xl border border-slate-200/80 dark:!border-slate-700/80 overflow-hidden"
                            >
                                <Box
                                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                    onClick={() => toggleModule(module.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400 font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white">
                                                {module.titulli}
                                            </Typography>
                                            <Typography variant="caption" className="!text-slate-500 dark:!text-slate-400">
                                                {module.pershkrimi}
                                            </Typography>
                                        </div>
                                    </div>
                                    {expandedModule === module.id
                                        ? <ExpandLessRounded className="text-sky-600" />
                                        : <ExpandMoreRounded className="text-slate-400" />
                                    }
                                </Box>

                                {expandedModule === module.id && (
                                    <Box className="border-t border-slate-100 dark:border-slate-800">
                                        {!lessons[module.id] ? (
                                            <Box className="flex justify-center py-6">
                                                <CircularProgress size={24} className="!text-sky-500" />
                                            </Box>
                                        ) : lessons[module.id].length === 0 ? (
                                            <Box className="py-6 px-5">
                                                <Typography variant="body2" className="!text-slate-500">
                                                    Nuk ka leksione në këtë modul
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <div className="flex flex-col">
                                                {lessons[module.id].map((lesson, lIndex) => (
                                                    <Box
                                                        key={lesson.id}
                                                        className="flex items-center justify-between px-5 py-4 hover:bg-sky-50/30 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100/50 dark:border-slate-800/50 last:border-0 cursor-pointer"
                                                        onClick={() => navigate(`/lesson/${lesson.id}`)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-bold text-slate-400 w-6">
                                                                {lIndex + 1}
                                                            </span>
                                                            <div>
                                                                <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                                                                    {lesson.titulli}
                                                                </Typography>
                                                                <Typography variant="caption" className="!text-slate-500 dark:!text-slate-400">
                                                                    {lesson.lloji}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                        <PlayCircleFilledRounded className="text-sky-500" fontSize="small" />
                                                    </Box>
                                                ))}
                                            </div>
                                        )}
                                    </Box>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </Container>
            <Footer />

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card elevation={0} className="w-full max-w-md mx-4 rounded-3xl border border-slate-200/80 dark:!border-slate-700/80">
                        <CardContent className="!p-8">
                            <Typography variant="h6" className="!font-bold !text-slate-900 dark:!text-white !mb-2">
                                Regjistrohu në kurs
                            </Typography>
                            <Typography variant="body2" className="!text-slate-500 dark:!text-slate-400 !mb-6">
                                Fut kodin e regjistrimit që të ka dhënë mësuesi
                            </Typography>

                            <input
                                type="text"
                                value={enrollmentKey}
                                onChange={(e) => setEnrollmentKey(e.target.value)}
                                placeholder="Kodi i regjistrimit..."
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-800 dark:text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 transition mb-3"
                            />

                            {enrollError && (
                                <Typography variant="body2" className="!text-red-500 !mb-3">
                                    {enrollError}
                                </Typography>
                            )}

                            <div className="flex gap-3 mt-2">
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => {
                                        setShowModal(false)
                                        setEnrollError('')
                                        setEnrollmentKey('')
                                    }}
                                    className="!normal-case !rounded-full !border-slate-300 !text-slate-600"
                                >
                                    Anulo
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleEnroll}
                                    disabled={!enrollmentKey.trim() || enrolling}
                                    className="!normal-case !rounded-full !bg-sky-600"
                                >
                                    {enrolling ? 'Duke u regjistruar...' : 'Regjistrohu'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </section>
    )
}
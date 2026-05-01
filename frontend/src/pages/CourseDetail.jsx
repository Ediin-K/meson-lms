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

export default function CourseDetail() {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    const [course, setCourse] = useState(null)
    const [modules, setModules] = useState([])
    const [lessons, setLessons] = useState({})
    const [expandedModule, setExpandedModule] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true)
                const [courseRes, modulesRes] = await Promise.all([
                    axiosInstance.get(`/courses/${courseId}`),
                    axiosInstance.get(`/courses/${courseId}/modules`)
                ])
                setCourse(courseRes.data)
                setModules(modulesRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchCourse()
    }, [courseId])

    const toggleModule = async (moduleId) => {
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
                <Box className="mb-10">
                    <Typography variant="overline" className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400">
                        {course.categoryName}
                    </Typography>
                    <Typography variant="h3" component="h1" className="!mt-1 !font-extrabold !text-slate-900 dark:!text-white">
                        {course.titulli}
                    </Typography>
                    <Typography variant="body1" className="!mt-3 !max-w-2xl !text-slate-600 dark:!text-slate-400">
                        {course.pershkrimi}
                    </Typography>
                    <div className="mt-4 flex gap-4">
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

                {/* MODULES */}
                {modules.length === 0 ? (
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
                                {/* MODULE HEADER */}
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

                                {/* LESSONS */}
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
        </section>
    )
}
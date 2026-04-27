import { useParams, useNavigate, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import axiosInstance from "../services/axiosInstance"
import { useAppPreferences } from "../context/appPreferencesContext"
import Footer from "../components/ui/Footer"
import { Typography, Container, Box, Button, CircularProgress } from "@mui/material"
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded"
import LibraryBooksRounded from "@mui/icons-material/LibraryBooksRounded"
import PlayCircleFilledRounded from "@mui/icons-material/PlayCircleFilledRounded"

export default function SemesterPage() {
    const { semesterId } = useParams()
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true)

                const res = await axiosInstance.get('/courses/search', {
                    params: {
                        categoryId: 2,   // FIXED (nga backend yt)
                        semester: Number(semesterId)
                    }
                })

                setCourses(res.data)
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        }

        fetchCourses()
    }, [semesterId])

    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="lg" className="flex-grow py-8 px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">
                
                {/* BACK BUTTON */}
                <Button 
                    startIcon={<ArrowBackRounded />} 
                    onClick={() => navigate(-1)}
                    className="!mb-8 !normal-case !text-slate-600 dark:!text-slate-400 hover:!bg-sky-50 dark:hover:!bg-slate-800 !rounded-full !px-4 !py-2"
                >
                    {t('semester.back', 'Back to Dashboard')}
                </Button>

                {/* HEADER */}
                <Box className="mb-10 text-center md:text-left">
                    <Typography variant="overline" className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400">
                        {t('semester.overline', 'COURSE BROWSER')}
                    </Typography>
                    <Typography variant="h3" component="h1" className="!mt-1 !font-extrabold !text-slate-900 dark:!text-white">
                        {t('semester.title', 'Semester')} {semesterId}
                    </Typography>
                    <Typography variant="body1" className="!mt-3 !max-w-2xl !text-slate-600 dark:!text-slate-400 md:mx-0 mx-auto text-lg">
                        {t('semester.subtitle', 'Explore and manage your enrolled subjects for this semester.')}
                    </Typography>
                </Box>

                {/* CONTENT */}
                {loading ? (
                    <Box className="flex justify-center items-center py-24">
                        <CircularProgress className="!text-sky-500" />
                    </Box>
                ) : courses.length === 0 ? (
                    <Box className="flex flex-col justify-center items-center py-20 px-4 text-center bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
                        <LibraryBooksRounded className="!text-6xl text-slate-300 dark:text-slate-600 mb-4" />
                        <Typography variant="h6" className="!font-bold !text-slate-800 dark:!text-slate-200">
                            {t('semester.empty.title', 'No Courses Found')}
                        </Typography>
                        <Typography variant="body2" className="!mt-2 !text-slate-500 dark:!text-slate-400 max-w-sm">
                            {t('semester.empty.desc', "We couldn't find any active courses for this semester. Please check back later or contact your administrator.")}
                        </Typography>
                    </Box>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map(course => (
                            <Link 
                                to={`/course/${course.id}`} 
                                key={course.id}
                                className="group block h-full focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-3xl"
                            >
                                <div className="
                                    relative flex flex-col h-full overflow-hidden rounded-3xl 
                                    bg-white dark:bg-slate-900/90 
                                    border border-slate-200/80 dark:border-slate-700/80
                                    shadow-sm hover:shadow-xl hover:shadow-sky-200/40 dark:hover:shadow-sky-900/20
                                    transition-all duration-300 hover:-translate-y-1.5
                                ">
                                    {/* Card Header / Image placeholder */}
                                    <div className="h-32 bg-gradient-to-br from-sky-100 to-indigo-50 dark:from-slate-800 dark:to-slate-900 relative border-b border-slate-100/50 dark:border-slate-800">
                                        <div className="absolute inset-0 opacity-40 dark:opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                                        <div className="absolute bottom-3 left-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-sky-700 dark:bg-slate-800/95 dark:text-sky-400 shadow-sm border border-sky-100 dark:border-slate-700 uppercase tracking-wide">
                                                {course.categoryName || t('semester.courseBadge', 'Subject')}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Card Body */}
                                    <div className="p-5 flex flex-col flex-grow">
                                        <Typography variant="h6" className="!font-bold !text-slate-900 dark:!text-white !leading-tight mb-2 group-hover:!text-sky-600 dark:group-hover:!text-sky-400 transition-colors line-clamp-2">
                                            {course.titulli}
                                        </Typography>
                                        <Typography variant="body2" className="!text-slate-600 dark:!text-slate-400 line-clamp-3 mb-4 flex-grow">
                                            {course.pershkrimi || course.description || t('semester.noDescription', 'No description provided for this course.')}
                                        </Typography>
                                        
                                        {/* Card Footer */}
                                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                                                {t('semester.viewCourse', 'View Course')}
                                                <PlayCircleFilledRounded fontSize="small" className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </Container>

            {/* FOOTER */}
            <div className="mt-auto">
                <Footer />
            </div>
        </section>
    )
}
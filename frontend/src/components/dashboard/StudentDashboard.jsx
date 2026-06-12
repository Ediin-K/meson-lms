import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import Button from "@mui/material/Button"
import LinearProgress from "@mui/material/LinearProgress"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Alert from "@mui/material/Alert"
import CircularProgress from "@mui/material/CircularProgress"
import CampaignOutlined from "@mui/icons-material/CampaignOutlined"
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined"
import AssignmentTurnedInRounded from "@mui/icons-material/AssignmentTurnedInRounded"
import WorkspacePremiumRounded from "@mui/icons-material/WorkspacePremiumRounded"
import QuizRounded from "@mui/icons-material/QuizRounded"
import { useAppPreferences } from "../../context/appPreferencesContext.js"
import Footer from "../../components/ui/Footer.jsx"
import {
    getStudentEnrollments,
    getStudentCertificates,
    getStudentAssignmentSubmissions,
    getMyQuizAttempts,
} from "../../services/studentProfileService.js"
import progressService from "../../services/progressService.js"
import assignmentService from "../../services/assignmentService.js"
import { formatDateTime } from "../../lib/dateFormat.js"
import Chip from "@mui/material/Chip"

const STATUS_STYLE = {
    UPCOMING:  { color: 'info',    key: 'studentDash.statusUpcoming' },
    MISSED:    { color: 'error',   key: 'studentDash.statusMissed' },
    SUBMITTED: { color: 'success', key: 'studentDash.statusSubmitted' },
    LATE:      { color: 'warning', key: 'studentDash.statusLate' },
    GRADED:    { color: 'secondary', key: 'studentDash.statusGraded' },
}

function AssignmentOverviewSection({ rows, t, locale, navigate }) {
    const recentGrades = rows
        .filter(r => r.status === 'GRADED' && r.grade != null)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5)

    return (
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Card elevation={0} className="lg:col-span-8 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 dark:!border-slate-700/90 dark:!bg-slate-900/50">
                <Typography variant="subtitle2" className="!mb-3 !font-bold !text-slate-800 dark:!text-white">
                    {t('studentDash.assignmentsTitle')}
                </Typography>
                {rows.length === 0 ? (
                    <Typography variant="body2" className="!text-slate-500">{t('studentDash.noAssignments')}</Typography>
                ) : (
                    <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                        {rows.map(r => {
                            const style = STATUS_STYLE[r.status] || STATUS_STYLE.UPCOMING
                            return (
                                <div key={r.assignmentId}
                                     className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 cursor-pointer hover:border-sky-400 transition-colors"
                                     onClick={() => navigate(`/assignment/${r.assignmentId}`)}>
                                    <div className="flex-1 min-w-0">
                                        <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white truncate">
                                            {r.title}
                                        </Typography>
                                        <Typography variant="caption" className="!text-slate-500 !block truncate">
                                            {r.subjectTitle} · {t('studentDash.colDeadline')}: {formatDateTime(r.deadline, locale)}
                                        </Typography>
                                    </div>
                                    {r.grade != null && (
                                        <Typography variant="body2" className="!font-bold !text-emerald-600 shrink-0">
                                            {r.grade}
                                        </Typography>
                                    )}
                                    <Chip size="small" color={style.color} label={t(style.key)} className="!font-semibold shrink-0" />
                                </div>
                            )
                        })}
                    </div>
                )}
            </Card>
            <Card elevation={0} className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 dark:!border-slate-700/90 dark:!bg-slate-900/50">
                <Typography variant="subtitle2" className="!mb-3 !font-bold !text-slate-800 dark:!text-white">
                    {t('studentDash.recentGradesTitle')}
                </Typography>
                {recentGrades.length === 0 ? (
                    <Typography variant="body2" className="!text-slate-500">{t('studentDash.noGrades')}</Typography>
                ) : (
                    <div className="flex flex-col gap-2">
                        {recentGrades.map(r => (
                            <div key={r.assignmentId} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2">
                                <div className="min-w-0">
                                    <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white truncate">
                                        {r.title}
                                    </Typography>
                                    <Typography variant="caption" className="!text-slate-500 !block truncate">
                                        {r.subjectTitle}
                                    </Typography>
                                </div>
                                <Typography variant="h6" className="!font-extrabold !text-emerald-600 shrink-0">
                                    {r.grade}
                                </Typography>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}

export default function StudentDashboard() {
    const { t, locale } = useAppPreferences()
    const navigate = useNavigate()
    const userId = localStorage.getItem('userId')

    const semesters = Array.from({ length: 6 }, (_, i) => i + 1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [enrollments, setEnrollments] = useState([])
    const [certificates, setCertificates] = useState([])
    const [submissions, setSubmissions] = useState([])
    const [quizAttempts, setQuizAttempts] = useState([])
    const [subjectProgressById, setsubjectProgressById] = useState({})
    const [assignmentOverview, setAssignmentOverview] = useState([])

    useEffect(() => {
        let ignore = false

        async function loadDashboard() {
            if (!userId) {
                setLoading(false)
                return
            }

            setLoading(true)
            setError("")
            const results = await Promise.allSettled([
                getStudentEnrollments(userId),
                getStudentCertificates(userId),
                getStudentAssignmentSubmissions(),
                getMyQuizAttempts(),
                assignmentService.getMyOverview().then(r => r.data),
            ])

            if (ignore) return

            if (results[4]?.status === 'fulfilled') {
                setAssignmentOverview(results[4].value)
            }
            if (results.some((result) => result.status === 'rejected')) {
                setError("Disa te dhena dinamike nuk u ngarkuan.")
            }
            if (results[0].status === 'fulfilled') {
                const loadedEnrollments = results[0].value
                setEnrollments(loadedEnrollments)

                const progressResults = await Promise.allSettled(
                    loadedEnrollments
                        .filter((enrollment) => enrollment.subjectId)
                        .map((enrollment) => progressService.getSubjectProgress(enrollment.subjectId)),
                )

                if (ignore) return

                const progressMap = {}
                progressResults.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        const progress = result.value.data
                        progressMap[String(progress.subjectId)] = progress
                    }
                })
                setsubjectProgressById(progressMap)
            }
            if (results[1].status === 'fulfilled') setCertificates(results[1].value)
            if (results[2].status === 'fulfilled') setSubmissions(results[2].value)
            if (results[3].status === 'fulfilled') setQuizAttempts(results[3].value)
            setLoading(false)
        }

        loadDashboard()
        return () => {
            ignore = true
        }
    }, [userId])

    const activeEnrollments = useMemo(
        () => enrollments.filter((enrollment) => enrollment.statusi === 'AKTIV'),
        [enrollments],
    )

    const progressEnrollments = useMemo(
        () => enrollments.filter((enrollment) => enrollment.subjectId && enrollment.statusi !== 'ANULUAR'),
        [enrollments],
    )

    const averageProgress = useMemo(() => {
        const values = progressEnrollments
            .map((enrollment) => {
                const subjectProgress = subjectProgressById[String(enrollment.subjectId)]?.progressPercent
                return subjectProgress ?? enrollment.progresi
            })
            .filter((progress) => progress != null)
        if (!values.length) return 0
        return Math.round(values.reduce((sum, progress) => sum + progress, 0) / values.length)
    }, [subjectProgressById, progressEnrollments])

    const latestEnrollment = activeEnrollments[0] || enrollments[0]
    const lastSubjectId = localStorage.getItem('lastSubjectId') || latestEnrollment?.subjectId
    const latestTasks = submissions.slice(0, 3)

    const studentStats = [
        {
            label: t('home.student.subjects.overline') || "Lëndë aktive",
            value: activeEnrollments.length,
            icon: MenuBookOutlined,
            color: "text-sky-600",
            bg: "bg-sky-100 dark:bg-sky-900/40",
        },
        {
            label: t('studentProfile.stats.progress'),
            value: `${averageProgress}%`,
            icon: AssignmentTurnedInRounded,
            color: "text-indigo-600",
            bg: "bg-indigo-100 dark:bg-indigo-900/40",
        },
        {
            label: t('studentProfile.stats.certificates'),
            value: certificates.length,
            icon: WorkspacePremiumRounded,
            color: "text-emerald-600",
            bg: "bg-emerald-100 dark:bg-emerald-900/40",
        },
        {
            label: t('studentProfile.quizzes'),
            value: quizAttempts.length,
            icon: QuizRounded,
            color: "text-amber-700",
            bg: "bg-amber-100 dark:bg-amber-900/40",
        },
    ]

    return (
        <section
            className="mb-6 rounded-2xl border border-sky-200/60 bg-white/90 p-4 shadow-sm ring-1 ring-sky-100/50 sm:p-6 dark:!border-slate-700/60 dark:!bg-slate-900/85 dark:!ring-slate-600/50"
            aria-labelledby="student-dash-heading"
        >
            <Typography
                id="student-dash-heading"
                variant="overline"
                className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400"
            >
                {t('home.student.overline')}
            </Typography>
            <Typography variant="h5" component="h2" className="!mt-1 !font-bold !text-slate-800 dark:!text-white">
                {t('home.student.welcome')}
            </Typography>
            {error && (
                <Alert severity="warning" className="!mt-4 !rounded-xl">
                    {error}
                </Alert>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {studentStats.map((stat) => (
                    <Card key={stat.label} elevation={0} className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 dark:!border-slate-700/90 dark:!bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon fontSize="small" />
                            </div>
                            <div>
                                <Typography variant="caption" className="!block !font-bold !uppercase !tracking-wide !text-slate-500 dark:!text-slate-400">
                                    {stat.label}
                                </Typography>
                                <Typography variant="h6" className="!font-extrabold !text-slate-900 dark:!text-white">
                                    {loading ? <CircularProgress size={18} color="inherit" /> : stat.value}
                                </Typography>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <AssignmentOverviewSection rows={assignmentOverview} t={t} locale={locale} navigate={navigate} />

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5 lg:items-stretch">

                {}
                <aside className="order-2 flex flex-col lg:order-1 lg:col-span-3">
                    <Card
                        elevation={0}
                        component="section"
                        aria-labelledby="student-news-heading"
                        className="h-full rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 flex flex-col dark:!border-slate-700/90 dark:!bg-slate-900/50"
                    >
                        <Typography
                            id="student-news-heading"
                            variant="subtitle2"
                            className="!mb-3 !flex !items-center !gap-2 !font-bold !text-amber-950 dark:!text-amber-100"
                        >
                            <CampaignOutlined className="text-amber-700" fontSize="small" />
                            {t('home.student.announcementsTitle')}
                        </Typography>
                        <ul className="list-none space-y-2.5 p-0 flex-1">
                            <li>
                                <Typography variant="body2" className="!text-slate-800 dark:!text-slate-200">
                                    • {t('home.student.announcement1')}
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2" className="!text-slate-800 dark:!text-slate-200">
                                    • {t('home.student.announcement2')}
                                </Typography>
                            </li>
                        </ul>
                        <Button
                            onClick={() => navigate('/notifications')}
                            size="small"
                            className="!mt-4 !w-full !rounded-xl !bg-white/60 !py-1.5 !font-semibold !text-amber-800 shadow-sm ring-1 ring-amber-200/50 transition-colors hover:!bg-amber-50 hover:!text-amber-900 dark:!bg-slate-800/60 dark:!text-amber-400 dark:ring-amber-900/30 dark:hover:!bg-slate-800 dark:hover:!text-amber-300"
                        >
                            {t('home.student.viewAllNotifications')}
                        </Button>
                    </Card>
                </aside>

                {}
                <div className="order-1 lg:order-2 lg:col-span-6">
                    <Card
                        elevation={0}
                        className="flex h-full min-h-[220px] flex-col justify-center rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 sm:min-h-[260px] sm:p-6 dark:!border-slate-700/90 dark:!bg-slate-900/50"
                    >
                        <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white">
                            {t('home.student.continueTitle')}
                        </Typography>
                        {latestEnrollment?.subjectTitulli && (
                            <Typography variant="body2" className="!mt-2 !font-medium !text-slate-600 dark:!text-slate-300">
                                {latestEnrollment.subjectTitulli}
                            </Typography>
                        )}
                        <Button
                            variant="contained"
                            size="large"
                            className="!mt-5 !w-full !rounded-full !bg-sky-600 !py-2.5 !font-semibold !normal-case hover:!bg-sky-700 sm:!mt-6 sm:!w-auto"
                            startIcon={<MenuBookOutlined />}
                            disabled={!lastSubjectId}
                            onClick={() => {
                                if (lastSubjectId) navigate(`/subject/${lastSubjectId}`)
                            }}
                        >
                            {t('home.student.continueBtn')}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            className="!mt-3 !w-full !rounded-full !py-2.5 !font-semibold !normal-case !border-sky-300 !text-sky-700 hover:!bg-sky-50 dark:!border-sky-500 dark:!text-sky-300 dark:hover:!bg-sky-950 sm:!w-auto"
                            onClick={() => navigate('/student/groups')}
                        >
                            {t('studentDashboard.groupsSchedule')}
                        </Button>
                    </Card>
                </div>

                {}
                <aside className="order-3 lg:col-span-3">
                    <Card
                        elevation={0}
                        component="section"
                        aria-labelledby="student-tasks-heading"
                        className="h-full rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 dark:!border-slate-700/90 dark:!bg-slate-900/50"
                    >
                        <Typography
                            id="student-tasks-heading"
                            variant="subtitle2"
                            className="!flex !items-center !gap-2 !font-bold !text-slate-900 dark:!text-white"
                        >
                            <AssignmentTurnedInRounded className="text-sky-600" fontSize="small" />
                            {t('home.student.tasks.panelTitle')}
                        </Typography>
                        <Typography variant="caption" className="!mt-1 !mb-3 !block !text-slate-500 dark:!text-slate-400">
                            {t('home.student.tasks.panelSubtitle')}
                        </Typography>
                        <div className="flex flex-col gap-3">
                            {latestTasks.length === 0 && (
                                <Typography variant="body2" className="!rounded-xl !border !border-dashed !border-slate-300 !p-3 !text-slate-500 dark:!border-slate-700 dark:!text-slate-400">
                                    {t('studentDashboard.noSubmissions')}
                                </Typography>
                            )}
                            {latestTasks.map((task) => {
                                const pct = task.submittedAt ? 100 : 0
                                return (
                                    <div
                                        key={task.id}
                                        className="rounded-xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm dark:border-slate-600/80 dark:bg-slate-800"
                                    >
                                        <Typography variant="body2" className="!font-semibold !text-slate-900 dark:!text-white">
                                            {task.assignmentTitle || t('home.student.tasks.panelTitle')}
                                        </Typography>
                                        <Typography variant="caption" className="!mt-0.5 !block !font-medium !text-sky-700 dark:!text-sky-400">
                                            {task.lessonTitle || t('studentDashboard.lessonFallback')}
                                        </Typography>
                                        <Typography variant="caption" className="!mt-1.5 !block !text-slate-600 dark:!text-slate-400">
                                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : t('studentDashboard.noDeadline')}
                                        </Typography>
                                        <div className="mt-2.5 flex items-center gap-2">
                                            <LinearProgress
                                                variant="determinate"
                                                value={pct}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 9999,
                                                    flexGrow: 1,
                                                    backgroundColor: 'rgba(15, 23, 42, 0.08)',
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: 9999,
                                                        backgroundColor: '#0284c7',
                                                    },
                                                }}
                                            />
                                            <Typography variant="caption" className="!shrink-0 !font-bold !tabular-nums !text-slate-700 dark:!text-slate-300">
                                                {pct}% {t('home.student.tasks.progressLabel')}
                                            </Typography>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <Button size="small" className="!mt-3 !w-full !font-semibold !text-sky-700 hover:!bg-sky-50 dark:!text-sky-400 dark:hover:!bg-sky-950">
                            {t('home.student.assignLink')}
                        </Button>
                    </Card>
                </aside>
            </div>

            <Container maxWidth="lg" className="!px-0 sm:!px-3" sx={{ mt: 4, mb: 6 }}>
                <Box className="mb-8 text-center md:text-left">
                    <Typography variant="overline" className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400">
                        {t('home.student.semesters.overline')}
                    </Typography>

                    <Typography variant="h4" component="h2" className="!mt-1 !font-bold !text-slate-800 dark:!text-white">
                        {t('home.student.semesters.title')}
                    </Typography>
                    <Typography variant="body1" className="!mt-2 !max-w-2xl !text-slate-600 md:mx-0 mx-auto dark:!text-slate-400">
                        {t('home.student.semesters.body')}
                    </Typography>
                </Box>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                    {semesters.map((sem) => (
                        <div
                            key={sem}
                            onClick={() => navigate(`/student/semester/${sem}`)}
                            className="
                                group
                                cursor-pointer
                                relative
                                overflow-hidden
                                rounded-3xl
                                border border-sky-100/60
                                bg-gradient-to-br from-white to-sky-50/50
                                dark:from-slate-900/90 dark:to-slate-800/80
                                dark:border-slate-700/60
                                p-6
                                min-h-[140px]
                                flex flex-col items-center justify-center
                                text-center
                                shadow-sm
                                transition-all duration-300 ease-out
                                hover:-translate-y-2
                                hover:shadow-xl hover:shadow-sky-200/40
                                hover:border-sky-300/80
                                dark:hover:shadow-sky-900/20
                                dark:hover:border-sky-500/80
                            "
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/0 via-sky-500/0 to-sky-500/5 dark:to-sky-400/5 group-hover:to-sky-500/10 transition-colors duration-300"></div>

                            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100/80 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400 mb-4 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white dark:group-hover:bg-sky-500 transition-all duration-300 shadow-sm">
                                <MenuBookOutlined fontSize="small" />
                            </div>

                            <Typography
                                className="
                                    !text-lg
                                    !font-bold
                                    !text-slate-800
                                    dark:!text-slate-100
                                    group-hover:!text-sky-700
                                    dark:group-hover:!text-white
                                    transition-colors
                                "
                            >
                                {t('home.student.semesters.semester')} {sem}
                            </Typography>
                        </div>
                    ))}
                </div>
            </Container>

            <Footer />
        </section>
    )
}

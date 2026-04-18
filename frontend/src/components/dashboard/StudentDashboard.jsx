import Typography from "@mui/material/Typography";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import Card from "@mui/material/Card";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import Button from "@mui/material/Button";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import AssignmentTurnedInRounded from "@mui/icons-material/AssignmentTurnedInRounded";
import LinearProgress from "@mui/material/LinearProgress";
import CodeRounded from "@mui/icons-material/CodeRounded";
import FunctionsRounded from "@mui/icons-material/FunctionsRounded";
import GraphicEqRounded from "@mui/icons-material/GraphicEqRounded";
import DataObjectRounded from "@mui/icons-material/DataObjectRounded";
import CalculateRounded from "@mui/icons-material/CalculateRounded";
import TranslateRounded from "@mui/icons-material/TranslateRounded";
import {useAppPreferences} from "../../context/appPreferencesContext.js";
import Footer from "../../components/ui/Footer.jsx";
import Box from "@mui/material/Box";
import {Link} from "react-router-dom";
import Container from "@mui/material/Container";
import{SpotlightCard} from "../../pages/Home.jsx";


function StudentFacultyBanner({ t }) {

    return (

        <section
            className="mb-6 rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 via-white to-slate-50 p-5 shadow-sm ring-1 ring-sky-100/60 sm:p-6 dark:border-slate-700/70 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-950 dark:to-indigo-950/60 dark:ring-slate-600/60"
            aria-labelledby="student-faculty-heading"
        >
            <Typography
                variant="overline"
                className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400"
            >
                {t('home.student.facultyOverline')}
            </Typography>
            <Typography
                id="student-faculty-heading"
                variant="h5"
                component="h2"
                className="!mt-1 !font-bold !text-slate-900 dark:!text-white"
            >
                {t('home.student.facultyTitle')}
            </Typography>
            <Typography variant="body2" className="!mt-2 !max-w-2xl !text-slate-600 dark:!text-slate-400">
                {t('home.student.facultyBody')}
            </Typography>
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-sky-100/80 bg-white/90 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:!border-slate-600/80 dark:!bg-slate-900/85">
                <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
            <SchoolRounded />
          </span>
                    <div>
                        <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white">
                            {t('home.student.facultyName')}
                        </Typography>
                        <Typography variant="body2" className="!text-slate-600 dark:!text-slate-400">
                            {t('home.student.facultyMeta')}
                        </Typography>
                        <Typography variant="caption" className="!mt-1 !block !text-slate-500 dark:!text-slate-500">
                            {t('home.student.facultyProgram')}
                        </Typography>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default function StudentDashboard() {
    const { t } = useAppPreferences()
    const STUDENT_TASK_KEYS = ['task1', 'task2', 'task3']

    const STUDENT_SUBJECT_ROWS = [
        { id: 'cs', icon: CodeRounded },
        { id: 'discrete', icon: FunctionsRounded },
        { id: 'signals', icon: GraphicEqRounded },
        { id: 'algo', icon: DataObjectRounded },
        { id: 'math', icon: CalculateRounded },
        { id: 'english', icon: TranslateRounded },
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

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5 lg:items-stretch">
                {/* Majtas: njoftime të shpejta */}
                <aside className="order-2 flex flex-col lg:order-1 lg:col-span-3">
                    <Card
                        elevation={0}
                        component="section"
                        aria-labelledby="student-news-heading"
                        className="h-full rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 dark:!border-slate-700/90 dark:!bg-slate-900/50"
                    >
                        <Typography
                            id="student-news-heading"
                            variant="subtitle2"
                            className="!mb-3 !flex !items-center !gap-2 !font-bold !text-amber-950 dark:!text-amber-100"
                        >
                            <CampaignOutlined className="text-amber-700" fontSize="small" />
                            {t('home.student.announcementsTitle')}
                        </Typography>
                        <ul className="list-none space-y-2.5 p-0">
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
                    </Card>
                </aside>

                {/* Mes: vazhdo ku e le */}
                <div className="order-1 lg:order-2 lg:col-span-6">
                    <Card
                        elevation={0}
                        className="flex h-full min-h-[220px] flex-col justify-center rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 sm:min-h-[260px] sm:p-6 dark:!border-slate-700/90 dark:!bg-slate-900/50"
                    >
                        <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white">
                            {t('home.student.continueTitle')}
                        </Typography>
                        <Typography variant="body2" className="!mt-2 !text-slate-600 dark:!text-slate-400">
                            {t('home.student.continueCourse')}
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            className="!mt-5 !w-full !rounded-full !bg-sky-600 !py-2.5 !font-semibold !normal-case hover:!bg-sky-700 sm:!mt-6 sm:!w-auto"
                            startIcon={<MenuBookOutlined />}
                        >
                            {t('home.student.continueBtn')}
                        </Button>
                    </Card>
                </div>

                {/* Djathtas: detyra, afate, zgjatje, % sipas lëndës */}
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
                            {STUDENT_TASK_KEYS.map((key) => {
                                const pct = Math.min(
                                    100,
                                    Math.max(0, parseInt(t(`home.student.tasks.${key}.progress`), 10) || 0),
                                )
                                return (
                                    <div
                                        key={key}
                                        className="rounded-xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm dark:border-slate-600/80 dark:bg-slate-800"
                                    >
                                        <Typography variant="body2" className="!font-semibold !text-slate-900 dark:!text-white">
                                            {t(`home.student.tasks.${key}.name`)}
                                        </Typography>
                                        <Typography variant="caption" className="!mt-0.5 !block !font-medium !text-sky-700 dark:!text-sky-400">
                                            {t(`home.student.tasks.${key}.course`)}
                                        </Typography>
                                        <Typography variant="caption" className="!mt-1.5 !block !text-slate-600 dark:!text-slate-400">
                                            {t(`home.student.tasks.${key}.due`)}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            className="!mt-0.5 !block !text-amber-900/90 dark:!text-amber-300/90"
                                        >
                                            {t(`home.student.tasks.${key}.extension`)}
                                        </Typography>
                                        <div className="mt-2.5 flex items-center gap-2">
                                            <LinearProgress
                                                variant="determinate"
                                                value={pct}
                                                className="!h-2 !flex-1 !rounded-full"
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 9999,
                                                    backgroundColor: 'rgba(15, 23, 42, 0.08)',
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: 9999,
                                                        backgroundColor: '#0284c7',
                                                    },
                                                }}
                                            />
                                            <Typography
                                                variant="caption"
                                                className="!shrink-0 !font-bold !tabular-nums !text-slate-700 dark:!text-slate-300"
                                            >
                                                {pct}% {t('home.student.tasks.progressLabel')}
                                            </Typography>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <Button
                            size="small"
                            className="!mt-3 !w-full !font-semibold !text-sky-700 hover:!bg-sky-50 dark:!text-sky-400 dark:hover:!bg-sky-950"
                        >
                            {t('home.student.assignLink')}
                        </Button>
                    </Card>
                </aside>

            </div>
            <Container maxWidth="lg" className="!px-0 sm:!px-3" sx={{ mt: 2, mb: 0 }}>
                <Box className="mb-8 text-center md:text-left">
                    <Typography
                        variant="overline"
                        className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400"
                    >
                        {t('home.student.subjects.overline')}
                    </Typography>
                    <Typography
                        variant="h4"
                        component="h2"
                        className="!mt-1 !font-bold !text-slate-800 dark:!text-white"
                    >
                        {t('home.student.subjects.title')}
                    </Typography>
                    <Typography
                        variant="body1"
                        className="!mt-2 !max-w-2xl !text-slate-600 md:mx-0 mx-auto dark:!text-slate-400"
                    >
                        {t('home.student.subjects.body')}
                    </Typography>
                </Box>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {STUDENT_SUBJECT_ROWS.map(({ id, icon }) => (
                        <Link key={id} to={`/course/${id}`} className="block">
                            <SpotlightCard
                                title={t(`home.student.subjects.${id}.title`)}
                                meta={t(`home.student.subjects.${id}.meta`)}
                                icon={icon}
                                chip={t('home.student.subjects.chipActive')}
                                chipColor="success"
                                actionLabel={t('home.student.subjects.openSubject')}
                                actionExternal={false}
                                imgLoading="lazy"
                            />
                        </Link>
                    ))}
                </div>
            </Container>
            <Typography variant="body2" className="!mt-5 !text-slate-600 dark:!text-slate-400">
                {t('home.student.dashboardHint')}
            </Typography>

            <Footer/>
        </section>
    )
}



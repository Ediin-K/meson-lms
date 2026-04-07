import { useParams, Link } from 'react-router-dom';
import { useAppPreferences } from '../context/appPreferencesContext.js';
import { COURSES_DATA } from '../lib/courseData.js';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';

export default function CourseDetail(){
    const { courseId } = useParams();
    const { t } = useAppPreferences();
    const course = COURSES_DATA[courseId];
    
    if (!course) {
        return (
            <Container maxWidth="lg" className="!px-0 sm:!px-3" sx={{ mt: 6, mb: 6 }}>
                <Typography variant="h4" className="!text-slate-800 dark:!text-white">
                    {t('course.notFound')}
                </Typography>
                <Link to="/" className="inline-flex items-center gap-2 mt-4 text-sky-600 hover:text-sky-700">
                    <ArrowBackRounded fontSize="small" />
                    {t('course.backToHome')}
                </Link>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" className="!px-0 sm:!px-3" sx={{ mt: 6, mb: 6 }}>
            {/* Header */}
            <Box className="mb-8 flex items-center justify-between">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                >
                    <ArrowBackRounded fontSize="small" />
                    {t('course.backToSubjects')}
                </Link>
                <Typography
                    variant="overline"
                    className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400"
                >
                    {t('course.subjectDetail')}
                </Typography>
            </Box>
            <Typography
                variant="h4"
                component="h1"
                className="!mt-1 !font-bold !text-slate-800 dark:!text-white"
            >
                {course.title}
            </Typography>
            <Typography variant="body1" className="!mt-2 !text-slate-600 dark:!text-slate-400">
                {course.description}
            </Typography>
            <Typography variant="body2" className="!mt-3 !text-slate-600 dark:!text-slate-400">
                {course.meta}
            </Typography>

            {/* Lessons Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {course.lessons.map((lesson) => (
                    <Card
                        key={lesson.id}
                        elevation={0}
                        className="group overflow-hidden rounded-[1.35rem] border border-sky-100/90 bg-white/90 shadow-md shadow-sky-100/40 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-200/50 dark:!border-slate-600 dark:!bg-slate-800 dark:!shadow-black/50 dark:hover:!border-slate-500 dark:hover:!shadow-black/60"
                    >
                        <Box className="relative aspect-[16/10] overflow-hidden rounded-t-[1.35rem] bg-slate-100 dark:bg-slate-800">
                            <img
                                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 750'%3E%3Crect fill='%23e8edff' width='1200' height='750'/%3E%3C/svg%3E"
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/15 to-sky-500/10" />
                            <div className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 text-sky-600 shadow-md backdrop-blur-sm dark:bg-slate-800/95 dark:text-sky-400">
                                <DescriptionRounded fontSize="medium" />
                            </div>
                        </Box>
                        <CardContent className="!rounded-b-[1.35rem] !p-4 !pt-3">
                            <Typography variant="h6" component="h3" className="!font-bold !text-slate-800 dark:!text-white">
                                Ligjerata {lesson.id}: {lesson.title}
                            </Typography>
                            <Typography variant="body2" className="!mt-0.5 !text-slate-500 dark:!text-slate-400">
                                {lesson.description}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </Container>
    );
}
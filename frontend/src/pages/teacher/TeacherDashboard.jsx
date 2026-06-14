import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../../context/appPreferencesContext";
import {
  Typography, Box, Card, CardContent, CircularProgress,
  Container, Grid, IconButton
} from "@mui/material";
import Alert from "@mui/material/Alert";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import QuizRounded from "@mui/icons-material/QuizRounded";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import AnalyticsRounded from "@mui/icons-material/AnalyticsRounded";
import LayersRounded from "@mui/icons-material/LayersRounded";
import GradeRounded from "@mui/icons-material/GradeRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import teacherContentService from "../../services/teacherContentService";

import Footer from "../../components/ui/Footer";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { t } = useAppPreferences();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    teacherContentService.getStats()
      .then(res => setStats(res.data))
      .catch(err => {
        console.error(err);
        setError(t("teacherDashboard.errorLoading"));
      })
      .finally(() => setLoading(false));
  }, []);

  const teacherServices = [
    {
      title: t("teacherDashboard.services.subjects.title"),
      desc: t("teacherDashboard.services.subjects.desc"),
      icon: SchoolRounded,
      path: "/teacher/subjects",
      color: "text-indigo-600",
      bg: "bg-indigo-100 dark:bg-indigo-900/40",
    },
    {
      title: t("teacherDashboard.services.students.title"),
      desc: t("teacherDashboard.services.students.desc"),
      icon: PeopleRounded,
      path: "/teacher/students",
      color: "text-violet-600",
      bg: "bg-violet-100 dark:bg-violet-900/40",
    },
    {
      title: t("teacherDashboard.services.stats.title"),
      desc: t("teacherDashboard.services.stats.desc"),
      icon: AnalyticsRounded,
      path: "/teacher/reports",
      color: "text-sky-600",
      bg: "bg-sky-100 dark:bg-sky-900/40",
    },
    {
      title: t("teacherDashboard.services.grades.title"),
      desc: t("teacherDashboard.services.grades.desc"),
      icon: GradeRounded,
      path: "/teacher/grades",
      color: "text-rose-600",
      bg: "bg-rose-100 dark:bg-rose-900/40",
    },
  ];

  return (
    <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8">
      <Box className="mb-10 rounded-[3rem] border border-slate-200/60 bg-white/80 p-6 shadow-2xl shadow-slate-200/20 sm:p-12 dark:!border-slate-700/60 dark:!bg-slate-900/50 dark:shadow-none">
        {}
        <Box className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Typography variant="overline" className="!font-bold !tracking-widest !text-indigo-600 dark:!text-indigo-400">
              {t("teacherDashboard.overline")}
            </Typography>
            <Typography variant="h3" component="h1" className="!mt-1 !font-black !text-slate-900 dark:!text-white">
              {t("teacherDashboard.welcome")}
            </Typography>
            <Typography variant="body1" className="!mt-3 !max-w-2xl !text-slate-600 dark:!text-slate-400 text-lg !font-medium">
              {t("teacherDashboard.subtitle")}
            </Typography>
          </div>
          <Box className="h-16 w-16 rounded-3xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
            <AnalyticsRounded fontSize="large" />
          </Box>
        </Box>

        {}
        {error && (
          <Alert severity="error" className="!mt-8 !rounded-2xl">
            {error}
          </Alert>
        )}

        {!loading && stats ? (
          <Box className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t("teacherDashboard.statsSubjects"), value: stats.totalSubjects, icon: SchoolRounded, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
              { label: t("teacherDashboard.statsStudents"), value: stats.totalStudents, icon: PeopleRounded, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-900/20" },
              { label: t("teacherDashboard.statsQuizzes"), value: stats.totalQuizzes, icon: QuizRounded, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
              { label: t("teacherDashboard.statsAssignments"), value: stats.totalAssignments, icon: AssignmentRounded, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            ].map((s, i) => (
              <Box key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
                <div className={`h-10 w-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}>
                  <s.icon fontSize="small" />
                </div>
                <Typography variant="caption" className="!text-slate-500 !uppercase !font-bold !tracking-widest !block">
                  {s.label}
                </Typography>
                <Typography variant="h4" className="!font-black dark:!text-white">
                  {s.value}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Box className="mt-10 flex justify-center p-12">
            <CircularProgress color="inherit" />
          </Box>
        )}

        {}
        <Typography variant="h5" className="!mt-20 !mb-8 !font-black !text-slate-800 dark:!text-white flex items-center justify-center gap-3">
          <LayersRounded className="text-indigo-600" />
          {t("teacherDashboard.servicesTitle")}
        </Typography>

        <Box
          className="max-w-[1400px] mx-auto mb-16"
          sx={{
            display: "grid",
            gap: 4,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
          }}
        >
          {teacherServices.map((service) => (
            <Card
              key={service.title}
              elevation={0}
              className="group relative flex flex-col rounded-[2.5rem] border border-slate-200/80 bg-white dark:!bg-slate-800/40 dark:!border-slate-800 hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer overflow-hidden"
              onClick={() => navigate(service.path)}
            >
              <CardContent className="!p-8 flex flex-col h-full relative z-10">
                <Box className={`h-16 w-16 rounded-3xl ${service.bg} flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                  <service.icon className={`${service.color} !text-3xl`} />
                </Box>
                <Typography variant="h6" className="!font-black !text-slate-900 dark:!text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {service.title}
                </Typography>
                <Typography variant="body2" className="!text-slate-500 dark:!text-slate-400 mb-10 flex-grow leading-relaxed !font-medium !text-base">
                  {service.desc}
                </Typography>
                <Box className="flex items-center text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-[0.2em] mt-auto">
                  {t("teacherDashboard.enterService")}
                  <ArrowForwardRounded
                    className="ml-2 !text-lg transition-transform group-hover:translate-x-3"
                    sx={{ color: "var(--teacher-action-icon)" }}
                  />
                </Box>
              </CardContent>
              <Box className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-indigo-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
            </Card>
          ))}
        </Box>

        <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
          <Footer />
        </div>
      </Box>
    </Container>
  );
}

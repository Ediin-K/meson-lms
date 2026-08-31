import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../../context/appPreferencesContext";
import {
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
} from "@mui/material";
import AutoStoriesRounded from "@mui/icons-material/AutoStoriesRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import ApartmentRounded from "@mui/icons-material/ApartmentRounded";
import Footer from "../../components/ui/Footer";
import { getDashboard } from "../../services/departmentHeadService";

export default function DepartmentHeadDashboard() {
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tiles = [
    {
      title: t("departmentHead.dashboard.subjectsTile.title"),
      desc: t("departmentHead.dashboard.subjectsTile.desc"),
      icon: AutoStoriesRounded,
      path: "/department-head/subjects",
      color: "text-sky-600",
      bg: "bg-sky-100 dark:bg-sky-900/40",
    },
    {
      title: t("departmentHead.dashboard.teachersTile.title"),
      desc: t("departmentHead.dashboard.teachersTile.desc"),
      icon: SchoolRounded,
      path: "/department-head/teachers",
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/40",
    },
    {
      title: t("departmentHead.dashboard.studentsTile.title"),
      desc: t("departmentHead.dashboard.studentsTile.desc"),
      icon: PeopleRounded,
      path: "/department-head/students",
      color: "text-indigo-600",
      bg: "bg-indigo-100 dark:bg-indigo-900/40",
    },
    {
      title: t("departmentHead.dashboard.auditTile.title"),
      desc: t("departmentHead.dashboard.auditTile.desc"),
      icon: HistoryRounded,
      path: "/department-head/grade-audit-log",
      color: "text-rose-600",
      bg: "bg-rose-100 dark:bg-rose-900/40",
    },
  ];

  return (
    <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8">
      <Box className="mb-10 rounded-[3rem] border border-slate-200/60 bg-white/80 p-6 shadow-2xl shadow-slate-200/20 sm:p-12 dark:!border-slate-700/60 dark:!bg-slate-900/50 dark:shadow-none">
        <Box className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Typography variant="overline" className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400">
              {stats?.departmentName || ""}
            </Typography>
            <Typography variant="h3" component="h1" className="!mt-1 !font-black !text-slate-900 dark:!text-white">
              {t("departmentHead.dashboard.title")}
            </Typography>
            <Typography variant="body1" className="!mt-3 !max-w-2xl !text-slate-600 dark:!text-slate-400 text-lg !font-medium">
              {t("departmentHead.dashboard.subtitle")}
            </Typography>
          </div>
          <Box className="h-16 w-16 rounded-3xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-inner">
            <ApartmentRounded fontSize="large" />
          </Box>
        </Box>

        {!loading && stats ? (
          <Box className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: t("departmentHead.dashboard.statSubjects"), value: stats.subjectCount, icon: AutoStoriesRounded, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-900/20" },
              { label: t("departmentHead.dashboard.statTeachers"), value: stats.teacherCount, icon: SchoolRounded, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
              { label: t("departmentHead.dashboard.statStudents"), value: stats.studentCount, icon: PeopleRounded, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
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

        <Box
          className="max-w-[1400px] mx-auto mt-16 mb-16"
          sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" } }}
        >
          {tiles.map((tile) => (
            <Card
              key={tile.title}
              elevation={0}
              className="group relative flex flex-col rounded-[2.5rem] border border-slate-200/80 bg-white dark:!bg-slate-800/40 dark:!border-slate-800 hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-sky-500/10 cursor-pointer overflow-hidden"
              onClick={() => navigate(tile.path)}
            >
              <CardContent className="!p-8 flex flex-col h-full relative z-10">
                <Box className={`h-16 w-16 rounded-3xl ${tile.bg} flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                  <tile.icon className={`${tile.color} !text-3xl`} />
                </Box>
                <Typography variant="h6" className="!font-black !text-slate-900 dark:!text-white mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {tile.title}
                </Typography>
                <Typography variant="body2" className="!text-slate-500 dark:!text-slate-400 mb-10 flex-grow leading-relaxed !font-medium !text-base">
                  {tile.desc}
                </Typography>
                <Box className="flex items-center text-sky-600 dark:text-sky-400 font-black text-xs uppercase tracking-[0.2em] mt-auto">
                  {t("home.admin.services.enter")}
                  <ArrowForwardRounded className="ml-2 !text-lg transition-transform group-hover:translate-x-3" />
                </Box>
              </CardContent>
              <Box className="absolute inset-0 bg-gradient-to-br from-sky-500/0 via-transparent to-sky-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
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

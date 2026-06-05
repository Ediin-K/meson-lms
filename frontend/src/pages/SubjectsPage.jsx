import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useAppPreferences } from "../context/appPreferencesContext";
import Footer from "../components/ui/Footer";
import {
  Typography,
  Container,
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Chip,
} from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";

export default function SubjectsPage() {
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/subjects");
        setSubjects(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <section className="flex flex-col flex-grow py-12 bg-slate-50/50 dark:bg-slate-950/20">
      <Container maxWidth="lg">
        {}
        <Box className="mb-10">
          <Typography variant="h4" className="!font-black !text-slate-900 dark:!text-white tracking-tight">
            {t("header.navsubjects", "Lëndët")}
          </Typography>
        </Box>

        {}
        <Card
          elevation={0}
          className="!rounded-[2rem] border border-slate-200/60 bg-white/90 dark:!bg-slate-900/50 backdrop-blur-xl overflow-hidden"
        >
          {loading ? (
            <Box className="flex justify-center py-32">
              <CircularProgress size={40} className="!text-slate-400" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead className="bg-slate-50/50 dark:!bg-slate-800/30">
                  <TableRow>
                    <TableCell className="!font-bold !text-slate-400 !uppercase !text-[11px] !tracking-widest !py-5 !pl-8">
                      {t("subjectsPage.titleCol")}
                    </TableCell>
                    <TableCell className="!font-bold !text-slate-400 !uppercase !text-[11px] !tracking-widest !py-5">
                      {t("subjectsPage.statusCol")}
                    </TableCell>
                    <TableCell align="right" className="!font-bold !text-slate-400 !uppercase !text-[11px] !tracking-widest !py-5 !pr-8">
                      {t("subjectsPage.actionCol")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" className="!py-20 text-slate-400">
                        {t("subjectsPage.noSubjects")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    subjects.map((course) => (
                      <TableRow
                        key={course.id}
                        hover
                        className="cursor-pointer group"
                        onClick={() => navigate(`/subjects/${course.id}`)}
                      >
                        <TableCell className="!py-6 !pl-8">
                          <Typography className="!font-bold !text-slate-800 dark:!text-slate-100 group-hover:text-sky-600 transition-colors">
                            {course.titulli}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={course.statusi || "AKTIV"}
                            size="small"
                            className={`!font-black !text-[10px] !uppercase !tracking-widest !rounded-lg ${
                              (course.statusi || "AKTIV") === "AKTIV"
                                ? "!bg-emerald-100 !text-emerald-700 dark:!bg-emerald-900/30 dark:!text-emerald-400"
                                : "!bg-slate-100 !text-slate-500 dark:!bg-slate-800 dark:!text-slate-400"
                            }`}
                          />
                        </TableCell>
                        <TableCell align="right" className="!pr-8">
                          <IconButton
                            size="small"
                            className="!text-slate-400 group-hover:!text-sky-500 transition-all"
                          >
                            <ArrowForwardRounded fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Container>
      <Footer />
    </section>
  );
}

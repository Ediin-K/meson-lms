import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../../context/appPreferencesContext";
import {
  Typography, Container, Box, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, CircularProgress, Alert, Chip,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import Footer from "../../components/ui/Footer";
import { getAssistantSubjects } from "../../services/assistantService";

export default function TeacherSections() {
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSubjects(await getAssistantSubjects());
    } catch (err) {
      setError(err?.response?.data?.message || t("assistant.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  return (
    <section className="flex flex-col min-h-screen">
      <Container maxWidth="lg" className="grow py-8 mt-4 sm:mt-8">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/teacher")}
          className="mb-6! normal-case! text-slate-600! dark:text-slate-400!"
        >
          {t("assistant.backToPanel")}
        </Button>

        <Box className="mb-8 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
            <GroupsRounded className="text-indigo-600 text-xl!" />
          </div>
          <div>
            <Typography variant="h4" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
              {t("assistant.title")}
            </Typography>
            <Typography variant="body1" className="text-slate-600! dark:text-slate-400!">
              {t("assistant.subtitle")}
            </Typography>
          </div>
        </Box>

        {error ? <Alert severity="error" className="!mb-4">{error}</Alert> : null}

        <Card
          elevation={0}
          className="rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900/60! dark:border-slate-700/80! overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
        >
          {loading ? (
            <Box className="flex justify-center py-24"><CircularProgress className="text-indigo-500!" /></Box>
          ) : subjects.length === 0 ? (
            <Box className="flex flex-col items-center justify-center py-20 gap-2 px-6 text-center">
              <Typography className="font-semibold! text-slate-500!">{t("assistant.noSections")}</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead className="bg-slate-50 dark:bg-slate-800/80!">
                  <TableRow>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("assistant.tableSubject")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("assistant.tableSections")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!" align="right">{t("assistant.tableStudents")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjects.map((s) => (
                    <TableRow
                      key={s.subjectId}
                      hover
                      className="cursor-pointer"
                      onClick={() => navigate(`/teacher/sections/${s.subjectId}`)}
                    >
                      <TableCell className="font-semibold! text-slate-800! dark:text-slate-100!">{s.subjectTitulli}</TableCell>
                      <TableCell>
                        <Box className="flex flex-wrap gap-1">
                          {(s.sectionNames || []).map((name, i) => (
                            <Chip key={i} size="small" label={name}
                              className="!bg-indigo-50 !text-indigo-700 dark:!bg-indigo-950/60 dark:!text-indigo-300" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right" className="font-black! text-slate-800! dark:text-slate-100!">{s.studentCount}</TableCell>
                    </TableRow>
                  ))}
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../../context/appPreferencesContext";
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
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
} from "@mui/material";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import Footer from "../../components/ui/Footer";
import { getStudents } from "../../services/departmentHeadService";

export default function DepartmentHeadStudents() {
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudents()
      .then(setStudents)
      .catch((err) => setError(err.response?.data?.message || t("departmentHead.students.noData")))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <section className="flex flex-col min-h-screen">
      <Container maxWidth="lg" className="grow py-8 mt-4 sm:mt-8">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/department-head")}
          className="mb-6! normal-case! text-slate-600! dark:text-slate-400!"
        >
          {t("departmentHead.backToPanel")}
        </Button>

        <Box className="mb-8 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
            <PeopleRounded className="text-indigo-600 text-xl!" />
          </div>
          <div>
            <Typography variant="h4" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
              {t("departmentHead.students.title")}
            </Typography>
            <Typography variant="body1" className="text-slate-600! dark:text-slate-400!">
              {t("departmentHead.students.subtitle")}
            </Typography>
          </div>
        </Box>

        {error ? <Alert severity="error" className="!mb-4">{error}</Alert> : null}

        <Card elevation={0} className="rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900/60! dark:border-slate-700/80! overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
          {loading ? (
            <Box className="flex justify-center py-24">
              <CircularProgress className="text-indigo-500!" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead className="bg-slate-50 dark:bg-slate-800/80!">
                  <TableRow>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("departmentHead.students.tableName")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("departmentHead.students.tableSubject")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("departmentHead.students.tableStatus")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("departmentHead.students.tableProgress")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" className="py-20!">
                        <Typography className="font-semibold! text-slate-500!">{t("departmentHead.students.noData")}</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((e) => (
                      <TableRow key={e.id} hover>
                        <TableCell className="font-semibold! text-slate-800! dark:text-slate-100!">{e.userEmri}</TableCell>
                        <TableCell className="text-slate-600! dark:text-slate-300!">{e.subjectTitulli}</TableCell>
                        <TableCell>
                          <Chip size="small" label={e.statusi} className="!font-bold rounded-lg! bg-slate-100! dark:bg-slate-800! text-slate-600! dark:text-slate-400!" />
                        </TableCell>
                        <TableCell className="w-40!">
                          <Box className="flex items-center gap-2">
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, Math.max(0, e.progresi || 0))}
                              className="flex-1 rounded-full! h-2!"
                            />
                            <Typography variant="caption" className="text-slate-500! font-bold! whitespace-nowrap">
                              {Math.round(e.progresi || 0)}%
                            </Typography>
                          </Box>
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

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
} from "@mui/material";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import Footer from "../../components/ui/Footer";
import { getSubjects } from "../../services/departmentHeadService";

export default function DepartmentHeadTeachers() {
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSubjects()
      .then((subjects) => {
        const byTeacher = new Map();
        subjects.forEach((s) => {
          if (!s.teacherId) return;
          const entry = byTeacher.get(s.teacherId) || { id: s.teacherId, name: s.teacherName, subjects: [] };
          entry.subjects.push(s.titulli);
          byTeacher.set(s.teacherId, entry);
        });
        setTeachers([...byTeacher.values()]);
      })
      .catch((err) => setError(err.response?.data?.message || t("departmentHead.teachers.noData")))
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
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <SchoolRounded className="text-amber-600 text-xl!" />
          </div>
          <div>
            <Typography variant="h4" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
              {t("departmentHead.teachers.title")}
            </Typography>
            <Typography variant="body1" className="text-slate-600! dark:text-slate-400!">
              {t("departmentHead.teachers.subtitle")}
            </Typography>
          </div>
        </Box>

        {error ? <Alert severity="error" className="!mb-4">{error}</Alert> : null}

        <Card elevation={0} className="rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900/60! dark:border-slate-700/80! overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
          {loading ? (
            <Box className="flex justify-center py-24">
              <CircularProgress className="text-amber-500!" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead className="bg-slate-50 dark:bg-slate-800/80!">
                  <TableRow>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("departmentHead.teachers.tableName")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("departmentHead.teachers.tableSubjects")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center" className="py-20!">
                        <Typography className="font-semibold! text-slate-500!">{t("departmentHead.teachers.noData")}</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    teachers.map((tc) => (
                      <TableRow key={tc.id} hover>
                        <TableCell className="font-semibold! text-slate-800! dark:text-slate-100!">{tc.name}</TableCell>
                        <TableCell>
                          <Box className="flex flex-wrap gap-1">
                            {tc.subjects.map((title) => (
                              <Chip key={title} size="small" label={title} className="font-bold! bg-slate-100! dark:bg-slate-800! text-slate-600! dark:text-slate-400! rounded-lg!" />
                            ))}
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

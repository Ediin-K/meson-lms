import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../context/appPreferencesContext";
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
  TablePagination,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import Footer from "../components/ui/Footer";
import { getGradeAuditLog } from "../services/gradeAuditService";

const ACTION_STYLE = {
  CREATED: "!bg-emerald-100 !text-emerald-800 dark:!bg-emerald-950/60 dark:!text-emerald-300",
  UPDATED: "!bg-sky-100 !text-sky-800 dark:!bg-sky-950/60 dark:!text-sky-300",
  DELETED: "!bg-rose-100 !text-rose-800 dark:!bg-rose-950/60 dark:!text-rose-300",
};

export default function AdminGradeAuditLog() {
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  const [entries, setEntries] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getGradeAuditLog(page, rowsPerPage);
      setEntries(data.content || []);
      setTotalElements(data.totalElements ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message || t("adminGradeAuditLog.loadError"));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, t]);

  useEffect(() => {
    load();
  }, [load]);

  const gradeChange = (entry) => {
    if (entry.action === "UPDATED") return `${entry.previousGrade} → ${entry.newGrade}`;
    if (entry.action === "CREATED") return `${entry.newGrade}`;
    return `${entry.previousGrade}`;
  };

  return (
    <section className="flex flex-col min-h-screen">
      <Container maxWidth="lg" className="grow py-8 mt-4 sm:mt-8">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/admin")}
          className="mb-6! normal-case! text-slate-600! dark:text-slate-400!"
        >
          {t("home.admin.services.backToPanel")}
        </Button>

        <Box className="mb-8 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
            <HistoryRounded className="text-rose-600 text-xl!" />
          </div>
          <div>
            <Typography variant="h4" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
              {t("adminGradeAuditLog.title")}
            </Typography>
            <Typography variant="body1" className="text-slate-600! dark:text-slate-400!">
              {t("adminGradeAuditLog.desc")}
            </Typography>
          </div>
        </Box>

        {error ? <Alert severity="error" className="!mb-4">{error}</Alert> : null}

        <Card
          elevation={0}
          className="rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900/60! dark:border-slate-700/80! overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
        >
          {loading ? (
            <Box className="flex justify-center py-24">
              <CircularProgress className="text-rose-500!" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead className="bg-slate-50 dark:bg-slate-800/80!">
                  <TableRow>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminGradeAuditLog.tableWhen")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminGradeAuditLog.tableStudent")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminGradeAuditLog.tableSubject")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminGradeAuditLog.tableAction")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminGradeAuditLog.tableGrade")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminGradeAuditLog.tableBy")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Box className="flex flex-col items-center justify-center py-20 gap-2">
                          <Typography className="font-semibold! text-slate-500!">
                            {t("adminGradeAuditLog.noData")}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((entry) => (
                      <TableRow key={entry.id} hover>
                        <TableCell className="text-slate-500! text-sm! whitespace-nowrap!">
                          {new Date(entry.performedAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-semibold! text-slate-800! dark:text-slate-100!">
                          {entry.studentName}
                        </TableCell>
                        <TableCell className="text-slate-600! dark:text-slate-300!">
                          {entry.subjectTitulli}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={t(`adminGradeAuditLog.action.${entry.action}`)} className={ACTION_STYLE[entry.action]} />
                        </TableCell>
                        <TableCell className="font-black! text-slate-800! dark:text-slate-100!">
                          {gradeChange(entry)}
                        </TableCell>
                        <TableCell className="text-slate-600! dark:text-slate-300!">
                          {entry.performedByName}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Card>
      </Container>
      <Footer />
    </section>
  );
}

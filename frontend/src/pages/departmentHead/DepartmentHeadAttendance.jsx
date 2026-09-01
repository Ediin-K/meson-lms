import { useCallback, useEffect, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import Footer from "../../components/ui/Footer";
import { getAttendanceSummary, getStudentAttendance } from "../../services/departmentHeadService";

const STATUS_STYLE = {
  PRESENT: "!bg-emerald-100 !text-emerald-800 dark:!bg-emerald-950/60 dark:!text-emerald-300",
  ABSENT: "!bg-rose-100 !text-rose-800 dark:!bg-rose-950/60 dark:!text-rose-300",
  LATE: "!bg-amber-100 !text-amber-800 dark:!bg-amber-950/60 dark:!text-amber-300",
  EXCUSED: "!bg-sky-100 !text-sky-800 dark:!bg-sky-950/60 dark:!text-sky-300",
};

function pctChipClass(row) {
  if (row.totalSessions === 0) return "!bg-slate-100 !text-slate-500 dark:!bg-slate-800 dark:!text-slate-400";
  if (row.presentPercentage >= 75) return STATUS_STYLE.PRESENT;
  if (row.presentPercentage >= 50) return STATUS_STYLE.LATE;
  return STATUS_STYLE.ABSENT;
}

function StatItem({ label, value, highlight }) {
  return (
    <Box className="flex flex-1 flex-col rounded-lg border border-slate-300 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
      <Typography variant="caption" className="!font-semibold !uppercase !tracking-wide !text-slate-500 dark:!text-slate-400">
        {label}
      </Typography>
      <Typography
        variant="h4"
        className={`!mt-1 !font-bold !tabular-nums ${highlight ? "!text-sky-700 dark:!text-sky-400" : "!text-slate-800 dark:!text-white"}`}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function DepartmentHeadAttendance() {
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null); // { studentId, studentName }
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await getAttendanceSummary());
    } catch (err) {
      setError(err?.response?.data?.message || t("departmentHead.attendance.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const openStudent = useCallback(async (row) => {
    setSelected(row);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      setDetail(await getStudentAttendance(row.studentId));
    } catch (err) {
      setDetailError(err?.response?.data?.message || t("departmentHead.attendance.loadError"));
    } finally {
      setDetailLoading(false);
    }
  }, [t]);

  const closeDialog = () => {
    setSelected(null);
    setDetail(null);
    setDetailError("");
  };

  const pctLabel = (row) => (row.totalSessions === 0 ? "—" : `${row.presentPercentage.toFixed(0)}%`);

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
          <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
            <EventAvailableRounded className="text-sky-600 text-xl!" />
          </div>
          <div>
            <Typography variant="h4" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
              {t("departmentHead.attendance.title")}
            </Typography>
            <Typography variant="body1" className="text-slate-600! dark:text-slate-400!">
              {t("departmentHead.attendance.subtitle")}
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
              <CircularProgress className="text-sky-500!" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead className="bg-slate-50 dark:bg-slate-800/80!">
                  <TableRow>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("departmentHead.attendance.tableName")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!" align="center">{t("departmentHead.attendance.tableSessions")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!" align="center">{t("departmentHead.attendance.tablePresentPct")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!" align="center">{t("departmentHead.attendance.tableAbsent")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!" align="center">{t("departmentHead.attendance.tableLate")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!" align="center">{t("departmentHead.attendance.tableExcused")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Box className="flex flex-col items-center justify-center py-20 gap-2">
                          <Typography className="font-semibold! text-slate-500!">
                            {t("departmentHead.attendance.noData")}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow
                        key={row.studentId}
                        hover
                        className="cursor-pointer"
                        onClick={() => openStudent(row)}
                      >
                        <TableCell className="font-semibold! text-slate-800! dark:text-slate-100!">
                          {row.studentName}
                        </TableCell>
                        <TableCell align="center" className="text-slate-600! dark:text-slate-300! tabular-nums!">
                          {row.totalSessions}
                        </TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={pctLabel(row)} className={`!font-bold ${pctChipClass(row)}`} />
                        </TableCell>
                        <TableCell align="center" className="text-slate-600! dark:text-slate-300! tabular-nums!">
                          {row.absentCount}
                        </TableCell>
                        <TableCell align="center" className="text-slate-600! dark:text-slate-300! tabular-nums!">
                          {row.lateCount}
                        </TableCell>
                        <TableCell align="center" className="text-slate-600! dark:text-slate-300! tabular-nums!">
                          {row.excusedCount}
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

      <Dialog open={Boolean(selected)} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle className="flex! items-center! justify-between! font-bold!">
          {selected?.studentName}
          <IconButton onClick={closeDialog} size="small">
            <CloseRounded />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box className="flex justify-center py-16">
              <CircularProgress />
            </Box>
          ) : detailError ? (
            <Alert severity="error">{detailError}</Alert>
          ) : detail ? (
            <>
              <Box className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatItem
                  label={t("departmentHead.attendance.statPresentPct")}
                  value={detail.totalSessions > 0 ? `${detail.presentPercentage.toFixed(0)}%` : "—"}
                  highlight
                />
                <StatItem label={t("departmentHead.attendance.statPresent")} value={detail.presentCount} />
                <StatItem label={t("departmentHead.attendance.statAbsent")} value={detail.absentCount} />
                <StatItem label={t("departmentHead.attendance.statLateExcused")} value={detail.lateCount + detail.excusedCount} />
              </Box>
              <TableContainer className="rounded-lg! border! border-slate-300! bg-white! dark:border-slate-700! dark:bg-slate-900!">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell className="font-bold!">{t("departmentHead.attendance.historyDate")}</TableCell>
                      <TableCell className="font-bold!">{t("departmentHead.attendance.historySubject")}</TableCell>
                      <TableCell className="font-bold!">{t("departmentHead.attendance.historyStatus")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail.records.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" className="py-10!">
                          {t("departmentHead.attendance.noHistory")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      detail.records.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.sessionDate}</TableCell>
                          <TableCell>{r.subjectTitulli}</TableCell>
                          <TableCell>
                            <Chip size="small" label={t(`teacherAttendance.status.${r.status}`)} className={STATUS_STYLE[r.status]} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} className="normal-case!">
            {t("departmentHead.attendance.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Snackbar,
  Alert,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from "@mui/material";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import GradesPageShell from "../../components/grades/GradesPageShell";
import { getStudentAttendance } from "../../services/attendanceService";
import { useAppPreferences } from "../../context/appPreferencesContext";

function StatItem({ label, value, highlight }) {
  return (
    <Box className="flex flex-1 flex-col rounded-lg border border-slate-300 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
      <Typography variant="caption" className="!font-semibold !uppercase !tracking-wide !text-slate-500 dark:!text-slate-400">
        {label}
      </Typography>
      <Typography
        variant="h4"
        className={`!mt-1 !font-bold !tabular-nums ${highlight ? "!text-[#1e3a5f] dark:!text-sky-400" : "!text-slate-800 dark:!text-white"}`}
      >
        {value}
      </Typography>
    </Box>
  );
}

const STATUS_STYLE = {
  PRESENT: "!bg-emerald-100 !text-emerald-800 dark:!bg-emerald-950/60 dark:!text-emerald-300",
  ABSENT: "!bg-rose-100 !text-rose-800 dark:!bg-rose-950/60 dark:!text-rose-300",
  LATE: "!bg-amber-100 !text-amber-800 dark:!bg-amber-950/60 dark:!text-amber-300",
  EXCUSED: "!bg-sky-100 !text-sky-800 dark:!bg-sky-950/60 dark:!text-sky-300",
};

export default function StudentAttendancePage() {
  const { t } = useAppPreferences();
  const userId = localStorage.getItem("userId");

  const [summary, setSummary] = useState({
    records: [],
    totalSessions: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 0,
    presentPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const loadAttendance = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getStudentAttendance(userId);
      setSummary(data);
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.response?.data?.error || error?.message ||
        t("studentAttendance.errorLoad");
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [userId, t]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const percentLabel = summary.totalSessions > 0 ? `${summary.presentPercentage.toFixed(0)}%` : "—";

  return (
    <GradesPageShell
      backTo="/student"
      backLabel={t("studentAttendance.backToPanel")}
      breadcrumbs={[
        { label: t("header.navDashboard", "Paneli"), to: "/student" },
        { label: t("studentAttendance.title") },
      ]}
      title={t("studentAttendance.title")}
      subtitle={t("studentAttendance.subtitle")}
      icon={EventAvailableRounded}
    >
      <Box className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatItem label={t("studentAttendance.statPresentPct")} value={percentLabel} highlight />
        <StatItem label={t("studentAttendance.statPresent")} value={summary.presentCount} />
        <StatItem label={t("studentAttendance.statAbsent")} value={summary.absentCount} />
        <StatItem label={t("studentAttendance.statLateExcused")} value={summary.lateCount + summary.excusedCount} />
      </Box>

      {loading ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer className="rounded-lg! border! border-slate-300! bg-white! dark:border-slate-700! dark:bg-slate-900!">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="font-bold!">{t("studentAttendance.tableDate")}</TableCell>
                <TableCell className="font-bold!">{t("studentAttendance.tableSubject")}</TableCell>
                <TableCell className="font-bold!">{t("studentAttendance.tableStatus")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" className="py-10!">
                    {t("studentAttendance.noData")}
                  </TableCell>
                </TableRow>
              ) : (
                summary.records.map((r) => (
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
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </GradesPageShell>
  );
}

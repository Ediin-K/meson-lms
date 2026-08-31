import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import GradesPageShell from "../../components/grades/GradesPageShell";
import { getTeacherSchedules } from "../../services/scheduleService";
import { getRoster, markAttendance } from "../../services/attendanceService";
import { useAppPreferences } from "../../context/appPreferencesContext";

const STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

const STATUS_LABEL = {
  PRESENT: "P",
  ABSENT: "A",
  LATE: "L",
  EXCUSED: "E",
};

const STATUS_COLOR = {
  PRESENT: "success",
  ABSENT: "error",
  LATE: "warning",
  EXCUSED: "info",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function TeacherAttendance() {
  const { t } = useAppPreferences();
  const teacherId = localStorage.getItem("userId");

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

  const loadSessions = useCallback(async () => {
    if (!teacherId) return;
    try {
      const data = await getTeacherSchedules(teacherId);
      setSessions(data || []);
    } catch (error) {
      showToast(getErrorMessage(error, t("teacherAttendance.toast.fetchSessionsError")), "error");
    }
  }, [teacherId]);

  const loadRoster = useCallback(async (sessionId, sessionDate) => {
    if (!sessionId || !sessionDate) return;
    setLoading(true);
    try {
      const data = await getRoster(sessionId, sessionDate);
      setRoster(data.map((entry) => ({ ...entry, status: entry.status || "PRESENT" })));
    } catch (error) {
      showToast(getErrorMessage(error, t("teacherAttendance.toast.fetchRosterError")), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (selectedSessionId && date) {
      loadRoster(selectedSessionId, date);
    } else {
      setRoster([]);
    }
  }, [selectedSessionId, date, loadRoster]);

  const selectedSession = sessions.find((s) => String(s.id) === String(selectedSessionId));

  const sessionLabel = (s) => {
    const group = s.subjectSubgroupName || s.subjectGroupName;
    return `${s.subjectTitle} — ${s.dayOfWeek} ${s.startTime}–${s.endTime}${group ? ` (${group})` : ""}`;
  };

  const setStudentStatus = (studentId, status) => {
    setRoster((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)));
  };

  const summary = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
    roster.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }, [roster]);

  const handleSave = async () => {
    if (!selectedSessionId || !date) return;
    setSaving(true);
    try {
      const marks = roster.map((r) => ({ studentId: r.studentId, status: r.status, comment: r.comment || null }));
      await markAttendance(selectedSessionId, date, marks);
      showToast(t("teacherAttendance.toast.saved"));
    } catch (error) {
      showToast(getErrorMessage(error, t("teacherAttendance.toast.saveError")), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <GradesPageShell
      backTo="/teacher"
      backLabel={t("teacherAttendance.backToPanel")}
      breadcrumbs={[
        { label: t("teacherAttendance.panelTitle"), to: "/teacher" },
        { label: t("teacherAttendance.title") },
      ]}
      title={t("teacherAttendance.title")}
      subtitle={t("teacherAttendance.subtitle")}
      icon={EventAvailableRounded}
    >
      <Box className="mb-5 rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
        <Box className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <FormControl size="small" className="w-full lg:max-w-md" required>
            <InputLabel>{t("teacherAttendance.sessionLabel")}</InputLabel>
            <Select
              value={selectedSessionId}
              label={t("teacherAttendance.sessionLabel")}
              onChange={(e) => setSelectedSessionId(e.target.value)}
            >
              <MenuItem value="">
                <em>{t("teacherAttendance.chooseSession")}</em>
              </MenuItem>
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {sessionLabel(s)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="date"
            label={t("teacherAttendance.dateLabel")}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={!selectedSessionId}
            className="w-full lg:w-56"
            InputLabelProps={{ shrink: true }}
          />

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!selectedSessionId || !date || roster.length === 0 || saving}
            className="!rounded-lg !normal-case !bg-[#2563eb] !shadow-none hover:!bg-[#1d4ed8]"
          >
            {saving ? <CircularProgress size={20} className="!text-white" /> : t("teacherAttendance.saveBtn")}
          </Button>
        </Box>

        {selectedSession && roster.length > 0 && (
          <Box className="mt-4 flex flex-wrap gap-3">
            {STATUSES.map((s) => (
              <Typography key={s} variant="caption" className="!font-semibold !text-slate-500 dark:!text-slate-400">
                {t(`teacherAttendance.status.${s}`)}: {summary[s]}
              </Typography>
            ))}
          </Box>
        )}
      </Box>

      {!selectedSessionId ? (
        <Box className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-slate-400 bg-white px-6 text-center dark:border-slate-600 dark:bg-slate-900">
          <Typography className="!text-slate-600 dark:!text-slate-400">
            {t("teacherAttendance.noSessionPrompt")}
          </Typography>
        </Box>
      ) : loading ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer className="rounded-lg! border! border-slate-300! bg-white! dark:border-slate-700! dark:bg-slate-900!">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="font-bold!">{t("teacherAttendance.tableStudent")}</TableCell>
                <TableCell align="right" className="font-bold!">{t("teacherAttendance.tableStatus")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roster.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" className="py-10!">
                    {t("teacherAttendance.noStudents")}
                  </TableCell>
                </TableRow>
              ) : (
                roster.map((r) => (
                  <TableRow key={r.studentId}>
                    <TableCell className="font-semibold!">{r.studentName}</TableCell>
                    <TableCell align="right">
                      <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={r.status}
                        onChange={(_, value) => value && setStudentStatus(r.studentId, value)}
                      >
                        {STATUSES.map((s) => (
                          <ToggleButton key={s} value={s} color={STATUS_COLOR[s]}>
                            {STATUS_LABEL[s]}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
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

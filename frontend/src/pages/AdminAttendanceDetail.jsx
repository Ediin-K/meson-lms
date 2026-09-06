import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  Button,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import Footer from "../components/ui/Footer";
import { getAdminStudentAttendance } from "../services/attendanceService";

const STATUS_STYLE = {
  PRESENT: "!bg-emerald-100 !text-emerald-800 dark:!bg-emerald-950/60 dark:!text-emerald-300",
  ABSENT: "!bg-rose-100 !text-rose-800 dark:!bg-rose-950/60 dark:!text-rose-300",
  LATE: "!bg-amber-100 !text-amber-800 dark:!bg-amber-950/60 dark:!text-amber-300",
  EXCUSED: "!bg-sky-100 !text-sky-800 dark:!bg-sky-950/60 dark:!text-sky-300",
};

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

export default function AdminAttendanceDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useAppPreferences();

  const departmentId = searchParams.get("departmentId");
  const subjectId = searchParams.get("subjectId") || undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;

  const studentName = location.state?.studentName;
  const departmentName = location.state?.departmentName;
  const backTo = location.state?.from || "/admin/attendance";

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDetail(await getAdminStudentAttendance(studentId, { departmentId, subjectId, dateFrom, dateTo }));
    } catch (err) {
      setError(err?.response?.data?.message || t("adminAttendance.loadError"));
    } finally {
      setLoading(false);
    }
  }, [studentId, departmentId, subjectId, dateFrom, dateTo, t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="flex flex-col min-h-screen">
      <Container maxWidth="md" className="grow py-8 mt-4 sm:mt-8">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate(backTo)}
          className="mb-6! normal-case! text-slate-600! dark:text-slate-400!"
        >
          {t("adminAttendance.title")}
        </Button>

        <Box className="mb-8 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
            <EventAvailableRounded className="text-sky-600 text-xl!" />
          </div>
          <div>
            <Typography variant="h4" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
              {studentName || `${t("adminAttendance.tableName")} #${studentId}`}
            </Typography>
            {departmentName ? (
              <Typography variant="body1" className="text-slate-600! dark:text-slate-400!">
                {departmentName}
              </Typography>
            ) : null}
          </div>
        </Box>

        {loading ? (
          <Box className="flex justify-center py-24">
            <CircularProgress className="text-sky-500!" />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : detail ? (
          <>
            <Box className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatItem
                label={t("adminAttendance.statPresentPct")}
                value={detail.totalSessions > 0 ? `${detail.presentPercentage.toFixed(0)}%` : "—"}
                highlight
              />
              <StatItem label={t("adminAttendance.statPresent")} value={detail.presentCount} />
              <StatItem label={t("adminAttendance.statAbsent")} value={detail.absentCount} />
              <StatItem label={t("adminAttendance.statLateExcused")} value={detail.lateCount + detail.excusedCount} />
            </Box>
            <Card
              elevation={0}
              className="rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900/60! dark:border-slate-700/80! overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
            >
              <TableContainer>
                <Table>
                  <TableHead className="bg-slate-50 dark:bg-slate-800/80!">
                    <TableRow>
                      <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminAttendance.historyDate")}</TableCell>
                      <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminAttendance.historySubject")}</TableCell>
                      <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminAttendance.historyStatus")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail.records.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" className="py-10!">
                          {t("adminAttendance.noHistory")}
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
            </Card>
          </>
        ) : null}
      </Container>
      <Footer />
    </section>
  );
}

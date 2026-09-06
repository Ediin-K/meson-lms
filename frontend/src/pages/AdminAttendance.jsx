import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import Footer from "../components/ui/Footer";
import axiosInstance from "../services/axiosInstance";
import { getAdminAttendanceSummary } from "../services/attendanceService";
import { downloadCsv } from "../utils/csvExport";

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

export default function AdminAttendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useAppPreferences();
  const [searchParams, setSearchParams] = useSearchParams();

  const departmentFilter = searchParams.get("departmentId") || "ALL";
  const subjectId = searchParams.get("subjectId") || "ALL";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const filtersActive = departmentFilter !== "ALL" || subjectId !== "ALL" || Boolean(dateFrom) || Boolean(dateTo);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allSubjects, setAllSubjects] = useState([]);

  useEffect(() => {
    axiosInstance.get("/subjects").then(({ data }) => setAllSubjects(data)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await getAdminAttendanceSummary({
        departmentId: departmentFilter === "ALL" ? undefined : departmentFilter,
        subjectId: subjectId === "ALL" ? undefined : subjectId,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }));
    } catch (err) {
      setError(err?.response?.data?.message || t("adminAttendance.loadError"));
    } finally {
      setLoading(false);
    }
  }, [departmentFilter, subjectId, dateFrom, dateTo, t]);

  useEffect(() => {
    load();
  }, [load]);

  const departments = useMemo(() => {
    const seen = new Map();
    allSubjects.forEach((s) => {
      if (s.departmentId != null && !seen.has(s.departmentId)) seen.set(s.departmentId, s.departmentName);
    });
    return [...seen.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allSubjects]);

  const subjectOptions = useMemo(
    () => allSubjects.filter((s) => departmentFilter === "ALL" || String(s.departmentId) === String(departmentFilter)),
    [allSubjects, departmentFilter],
  );

  const updateParams = (updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "ALL") next.delete(key);
        else next.set(key, value);
      });
      return next;
    }, { replace: true });
  };

  const handleDepartmentChange = (value) => updateParams({ departmentId: value, subjectId: "ALL" });
  const clearFilters = () => setSearchParams({}, { replace: true });

  const openStudent = (row) => {
    const qs = new URLSearchParams();
    qs.set("departmentId", String(row.departmentId));
    if (subjectId !== "ALL") qs.set("subjectId", subjectId);
    if (dateFrom) qs.set("dateFrom", dateFrom);
    if (dateTo) qs.set("dateTo", dateTo);
    navigate(`${row.studentId}?${qs.toString()}`, {
      state: {
        studentName: row.studentName,
        departmentName: row.departmentName,
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  const pctLabel = (row) => (row.totalSessions === 0 ? "—" : `${row.presentPercentage.toFixed(0)}%`);

  const exportCsv = () => {
    const headers = [
      t("adminAttendance.tableName"),
      t("adminAttendance.tableDepartment"),
      t("adminAttendance.tableSessions"),
      t("adminAttendance.tablePresentPct"),
      t("adminAttendance.tableAbsent"),
      t("adminAttendance.tableLate"),
      t("adminAttendance.tableExcused"),
    ];
    const csvRows = rows.map((row) => [
      row.studentName,
      row.departmentName,
      row.totalSessions,
      row.totalSessions === 0 ? "" : row.presentPercentage.toFixed(0),
      row.absentCount,
      row.lateCount,
      row.excusedCount,
    ]);
    downloadCsv(`vijueshmeria-admin-${new Date().toISOString().slice(0, 10)}.csv`, headers, csvRows);
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
          <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
            <EventAvailableRounded className="text-sky-600 text-xl!" />
          </div>
          <div>
            <Typography variant="h4" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
              {t("adminAttendance.title")}
            </Typography>
            <Typography variant="body1" className="text-slate-600! dark:text-slate-400!">
              {t("adminAttendance.subtitle")}
            </Typography>
          </div>
        </Box>

        {error ? <Alert severity="error" className="!mb-4">{error}</Alert> : null}

        <Box className="mb-4 flex flex-wrap items-end gap-3">
          <FormControl size="small" className="!min-w-[220px]">
            <InputLabel id="admin-attendance-dept-filter">{t("adminAttendance.filterDepartment")}</InputLabel>
            <Select
              labelId="admin-attendance-dept-filter"
              label={t("adminAttendance.filterDepartment")}
              value={departmentFilter}
              onChange={(e) => handleDepartmentChange(e.target.value)}
            >
              <MenuItem value="ALL">{t("adminAttendance.filterAll")}</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={String(d.id)}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" className="!min-w-[220px]">
            <InputLabel id="admin-attendance-subject-filter">{t("adminAttendance.filterSubject")}</InputLabel>
            <Select
              labelId="admin-attendance-subject-filter"
              label={t("adminAttendance.filterSubject")}
              value={subjectId}
              onChange={(e) => updateParams({ subjectId: e.target.value })}
            >
              <MenuItem value="ALL">{t("adminAttendance.filterSubjectAll")}</MenuItem>
              {subjectOptions.map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>{s.titulli}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            type="date"
            label={t("adminAttendance.filterDateFrom")}
            value={dateFrom}
            onChange={(e) => updateParams({ dateFrom: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label={t("adminAttendance.filterDateTo")}
            value={dateTo}
            onChange={(e) => updateParams({ dateTo: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          {filtersActive ? (
            <Button onClick={clearFilters} className="normal-case!">
              {t("adminAttendance.filterClear")}
            </Button>
          ) : null}
          <Button
            startIcon={<DownloadRounded />}
            onClick={exportCsv}
            disabled={rows.length === 0}
            className="normal-case! ml-auto!"
            variant="outlined"
          >
            {t("adminAttendance.exportCsv")}
          </Button>
        </Box>

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
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminAttendance.tableName")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminAttendance.tableDepartment")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!" align="center">{t("adminAttendance.tableSessions")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!" align="center">{t("adminAttendance.tablePresentPct")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!" align="center">{t("adminAttendance.tableAbsent")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!" align="center">{t("adminAttendance.tableLate")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!" align="center">{t("adminAttendance.tableExcused")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Box className="flex flex-col items-center justify-center py-20 gap-2">
                          <Typography className="font-semibold! text-slate-500!">
                            {t("adminAttendance.noData")}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow
                        key={`${row.studentId}-${row.departmentId}`}
                        hover
                        className="cursor-pointer"
                        onClick={() => openStudent(row)}
                      >
                        <TableCell className="font-semibold! text-slate-800! dark:text-slate-100!">
                          {row.studentName}
                        </TableCell>
                        <TableCell className="text-slate-600! dark:text-slate-300!">
                          {row.departmentName}
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
    </section>
  );
}

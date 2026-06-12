import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDateTime } from '../lib/dateFormat.js'
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Card,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import CancelRounded from "@mui/icons-material/CancelRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import {
  approveGroupRequest,
  getAdminGroupRequests,
  rejectGroupRequest,
} from "../services/studentGroupService";
import { getAllDepartments } from "../services/departmentService";
import { getDepartmentGroups } from "../services/departmentGroupService";
import { useAppPreferences } from "../context/appPreferencesContext";

export default function AdminGroupApplications() {
  const navigate = useNavigate();
  const { t, locale } = useAppPreferences();
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departmentGroups, setDepartmentGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "PENDING", departmentId: "", departmentGroupId: "" });
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const STATUS_OPTIONS = [
    { value: "", label: t('adminGroupApplications.statusAll') },
    { value: "PENDING", label: t('adminGroupApplications.statusPending') },
    { value: "APPROVED", label: t('adminGroupApplications.statusApproved') },
    { value: "REJECTED", label: t('adminGroupApplications.statusRejected') },
  ];

  const STATUS_CHIP = {
    PENDING: { label: t('adminGroupApplications.statusPending'), color: "warning" },
    APPROVED: { label: t('adminGroupApplications.statusApproved'), color: "success" },
    REJECTED: { label: t('adminGroupApplications.statusRejected'), color: "error" },
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.departmentId) params.departmentId = Number(filters.departmentId);
      if (filters.departmentGroupId) params.departmentGroupId = Number(filters.departmentGroupId);
      const data = await getAdminGroupRequests(params);
      setRequests(data);
    } catch (err) {
      setToast({
        open: true,
        message: err?.response?.data?.message || err.message || t('adminGroupApplications.toast.loadError'),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    getAllDepartments().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (filters.departmentId) {
      getDepartmentGroups(filters.departmentId).then(setDepartmentGroups).catch(() => setDepartmentGroups([]));
    } else {
      setDepartmentGroups([]);
    }
  }, [filters.departmentId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) =>
      `${r.studentFirstName} ${r.studentLastName} ${r.studentEmail} ${r.departmentGroupName} ${r.departmentName}`
        .toLowerCase()
        .includes(q),
    );
  }, [requests, search]);

  const handleApprove = async (id) => {
    try {
      setActionId(id);
      await approveGroupRequest(id);
      setToast({ open: true, message: t('adminGroupApplications.toast.approved'), severity: "success" });
      await loadRequests();
    } catch (err) {
      setToast({
        open: true,
        message: err?.response?.data?.message || err?.response?.data || err.message || t('adminGroupApplications.toast.error'),
        severity: "error",
      });
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionId(id);
      await rejectGroupRequest(id);
      setToast({ open: true, message: t('adminGroupApplications.toast.rejected'), severity: "success" });
      await loadRequests();
    } catch (err) {
      setToast({
        open: true,
        message: err?.response?.data?.message || err?.response?.data || err.message || t('adminGroupApplications.toast.error'),
        severity: "error",
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 grow">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/admin")}
          className="rounded-2xl! px-6! py-2! normal-case! font-bold! text-slate-600! dark:text-slate-400!"
        >
          {t('adminGroupApplications.backToPanel')}
        </Button>

        <Box className="my-8">
          <Typography variant="overline" className="font-bold! tracking-[0.3em]! text-indigo-600! dark:text-indigo-400!">
            {t('adminGroupApplications.overline')}
          </Typography>
          <Typography variant="h3" className="font-black! text-slate-900! dark:text-white!">
            {t('adminGroupApplications.title')}
          </Typography>
        </Box>

        <Card className="rounded-3xl! border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60! p-5 mb-6">
          <Box className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TextField
              placeholder={t('adminGroupApplications.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchRounded className="text-slate-400 mr-2" /> }}
              className="md:col-span-2"
            />
            <FormControl fullWidth>
              <InputLabel>{t('adminGroupApplications.statusLabel')}</InputLabel>
              <Select
                value={filters.status}
                label={t('adminGroupApplications.statusLabel')}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('adminGroupApplications.departmentLabel')}</InputLabel>
              <Select
                value={filters.departmentId}
                label={t('adminGroupApplications.departmentLabel')}
                onChange={(e) => setFilters((f) => ({ ...f, departmentId: e.target.value, departmentGroupId: "" }))}
              >
                <MenuItem value="">{t('adminGroupApplications.statusAll')}</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.emertimi}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth className="md:col-span-2">
              <InputLabel>{t('adminGroupApplications.groupLabel')}</InputLabel>
              <Select
                value={filters.departmentGroupId}
                label={t('adminGroupApplications.groupLabel')}
                disabled={!filters.departmentId}
                onChange={(e) => setFilters((f) => ({ ...f, departmentGroupId: e.target.value }))}
              >
                <MenuItem value="">{t('adminGroupApplications.statusAll')}</MenuItem>
                {departmentGroups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name} ({g.currentStudents}/{g.maxCapacity})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Card>

        {loading ? (
          <Box className="flex justify-center py-16"><CircularProgress /></Box>
        ) : (
          <TableContainer component={Card} className="rounded-3xl! border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60!">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="font-black!">{t('adminGroupApplications.tableFirstName')}</TableCell>
                  <TableCell className="font-black!">{t('adminGroupApplications.tableLastName')}</TableCell>
                  <TableCell className="font-black!">{t('adminGroupApplications.tableEmail')}</TableCell>
                  <TableCell className="font-black!">{t('adminGroupApplications.tableDepartment')}</TableCell>
                  <TableCell className="font-black!">{t('adminGroupApplications.tableGroup')}</TableCell>
                  <TableCell className="font-black!">{t('adminGroupApplications.tableStatus')}</TableCell>
                  <TableCell className="font-black!">{t('adminGroupApplications.tableDate')}</TableCell>
                  <TableCell className="font-black!" align="right">{t('adminGroupApplications.tableActions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((row) => {
                  const chip = STATUS_CHIP[row.status] || { label: row.status, color: "default" };
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.studentFirstName}</TableCell>
                      <TableCell>{row.studentLastName}</TableCell>
                      <TableCell>{row.studentEmail}</TableCell>
                      <TableCell>{row.departmentName}</TableCell>
                      <TableCell>
                        <Chip label={row.departmentGroupName} size="small" className="font-bold!" />
                      </TableCell>
                      <TableCell>
                        <Chip label={chip.label} color={chip.color} size="small" className="font-bold!" />
                      </TableCell>
                      <TableCell>
                        {row.appliedAt ? formatDateTime(row.appliedAt, locale) : "-"}
                      </TableCell>
                      <TableCell align="right">
                        {row.status === "PENDING" && (
                          <Box className="flex gap-2 justify-end">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleRounded />}
                              disabled={actionId === row.id}
                              onClick={() => handleApprove(row.id)}
                              className="rounded-xl! normal-case! font-bold!"
                            >
                              {t('adminGroupApplications.approveBtn')}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<CancelRounded />}
                              disabled={actionId === row.id}
                              onClick={() => handleReject(row.id)}
                              className="rounded-xl! normal-case! font-bold!"
                            >
                              {t('adminGroupApplications.rejectBtn')}
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" className="py-12 text-slate-400!">
                      {t('adminGroupApplications.noApplications')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} className="rounded-xl!">{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../context/appPreferencesContext";
import {
  Typography,
  Container,
  Box,
  Card,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Zoom,
  IconButton,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import HourglassTopRounded from "@mui/icons-material/HourglassTopRounded";
import BlockRounded from "@mui/icons-material/BlockRounded";
import Footer from "../components/ui/Footer";
import axiosInstance from "../services/axiosInstance";
import { getSubjectGroups } from "../services/subjectGroupService";
import {
  createEnrollment,
  updateEnrollmentProgress,
  updateEnrollmentStatus,
  deleteEnrollment,
} from "../services/enrollmentService";

export default function AdminEnrollments() {
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  const STATUS_CONFIG = {
    AKTIV: {
      label: t("adminEnrollments.statusActive"),
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      icon: HourglassTopRounded,
    },
    PERFUNDUAR: {
      label: t("adminEnrollments.statusCompleted"),
      color: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
      icon: CheckCircleRounded,
    },
    ANULUAR: {
      label: t("adminEnrollments.statusCancelled"),
      color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
      icon: BlockRounded,
    },
  };

  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [formData, setFormData] = useState({
    userId: "",
    subjectId: "",
    subjectGroupId: "",
    subjectSubgroupId: "",
    enrollmentKey: "",
    progresi: "0",
    statusi: "AKTIV",
  });
  const [submitting, setSubmitting] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const showToast = (message, severity = "success") => {
    setSnackbarSeverity(severity);
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  const getErrorMessage = (error, fallback) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback
    );
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({ all: 0, AKTIV: 0, PERFUNDUAR: 0, ANULUAR: 0 });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const loadEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: rowsPerPage,
        search: debouncedSearch,
        status: filterStatus === "all" ? "" : filterStatus,
      };
      const [pageRes, aktivRes, perfRes, anulRes] = await Promise.all([
        axiosInstance.get("/enrollments/paged", { params }),
        axiosInstance.get("/enrollments/paged", { params: { size: 1, status: "AKTIV" } }),
        axiosInstance.get("/enrollments/paged", { params: { size: 1, status: "PERFUNDUAR" } }),
        axiosInstance.get("/enrollments/paged", { params: { size: 1, status: "ANULUAR" } }),
      ]);
      setEnrollments(pageRes.data.content);
      setTotalCount(pageRes.data.totalElements);
      setStatusCounts({
        all: aktivRes.data.totalElements + perfRes.data.totalElements + anulRes.data.totalElements,
        AKTIV: aktivRes.data.totalElements,
        PERFUNDUAR: perfRes.data.totalElements,
        ANULUAR: anulRes.data.totalElements,
      });
    } catch (error) {
      showToast(
        getErrorMessage(error, t("adminEnrollments.toast.fetchError")),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, filterStatus]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data);
    } catch (error) {
      showToast(
        getErrorMessage(error, t("adminEnrollments.toast.fetchUsersError")),
        "error",
      );
    }
  }, []);

  const loadSubjects = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/subjects");
      setSubjects(response.data);
    } catch (error) {
      showToast(
        getErrorMessage(error, t("adminEnrollments.toast.fetchSubjectsError")),
        "error",
      );
    }
  }, []);

  useEffect(() => {
    loadEnrollments();
    loadUsers();
    loadSubjects();
  }, [loadEnrollments, loadUsers, loadSubjects]);

  const filtered = enrollments;
  const counts = statusCounts;

  const FILTERS = [
    { key: "all", label: `${t("adminEnrollments.filterAll")} (${counts.all})` },
    { key: "AKTIV", label: `${t("adminEnrollments.filterActive")} (${counts.AKTIV})` },
    { key: "PERFUNDUAR", label: `${t("adminEnrollments.filterCompleted")} (${counts.PERFUNDUAR})` },
    { key: "ANULUAR", label: `${t("adminEnrollments.filterCancelled")} (${counts.ANULUAR})` },
  ];

  const openAddDialog = () => {
    setIsEdit(false);
    setSelectedEnrollment(null);
    setSubjectGroups([]);
    setFormData({
      userId: "",
      subjectId: "",
      subjectGroupId: "",
      subjectSubgroupId: "",
      enrollmentKey: "",
      progresi: "0",
      statusi: "AKTIV",
    });
    setOpenDialog(true);
  };

  const openEditDialog = (enrollment) => {
    setIsEdit(true);
    setSelectedEnrollment(enrollment);
    setFormData({
      userId: enrollment.userId,
      subjectId: enrollment.subjectId,
      subjectGroupId: enrollment.subjectGroupId || "",
      subjectSubgroupId: enrollment.subjectSubgroupId || "",
      enrollmentKey: "",
      progresi: enrollment.progresi != null ? String(enrollment.progresi) : "0",
      statusi: enrollment.statusi || "AKTIV",
    });
    setOpenDialog(true);
  };

  const loadGroupsForSubject = async (subjectId) => {
    if (!subjectId) {
      setSubjectGroups([]);
      return;
    }

    try {
      const groups = await getSubjectGroups(subjectId);
      setSubjectGroups(groups);
    } catch (error) {
      showToast(getErrorMessage(error, t("adminEnrollments.toast.groupsError")), "error");
    }
  };

  const handleFieldChange = (key) => async (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "subjectId" ? { subjectGroupId: "", subjectSubgroupId: "" } : {}),
      ...(key === "subjectGroupId" ? { subjectSubgroupId: "" } : {}),
    }));

    if (key === "subjectId") {
      await loadGroupsForSubject(value);
    }
  };

  const handleSubmit = async () => {
    if (!isEdit && (!formData.userId || !formData.subjectId)) {
      showToast(t("adminEnrollments.toast.selectRequired"), "error");
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit && selectedEnrollment) {
        const progressValue = Number(formData.progresi ?? 0);
        const requests = [];

        if (progressValue !== Number(selectedEnrollment.progresi ?? 0)) {
          requests.push(
            updateEnrollmentProgress(selectedEnrollment.id, progressValue),
          );
        }

        if (formData.statusi !== selectedEnrollment.statusi) {
          requests.push(
            updateEnrollmentStatus(selectedEnrollment.id, formData.statusi),
          );
        }

        if (requests.length === 0) {
          showToast(t("adminEnrollments.toast.noChanges"), "info");
        } else {
          await Promise.all(requests);
          showToast(t("adminEnrollments.toast.updated"), "success");
        }
      } else {
        await createEnrollment({
          userId: Number(formData.userId),
          subjectId: Number(formData.subjectId),
          subjectGroupId: formData.subjectGroupId
            ? Number(formData.subjectGroupId)
            : undefined,
          subjectSubgroupId: formData.subjectSubgroupId
            ? Number(formData.subjectSubgroupId)
            : undefined,
          enrollmentKey: formData.enrollmentKey || undefined,
        });
        showToast(t("adminEnrollments.toast.created"), "success");
      }

      setOpenDialog(false);
      await loadEnrollments();
    } catch (error) {
      showToast(
        getErrorMessage(error, t("adminEnrollments.toast.saveError")),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedGroup = subjectGroups.find(
    (group) => group.id === Number(formData.subjectGroupId),
  );
  const availableSubgroups = selectedGroup?.subgroups || [];

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    try {
      await deleteEnrollment(deleteTarget.id);
      showToast(t("adminEnrollments.toast.deleted"), "success");
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      await loadEnrollments();
    } catch (error) {
      showToast(
        getErrorMessage(error, t("adminEnrollments.toast.deleteError")),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col min-h-screen">
      <Container maxWidth="lg" className="flex-grow py-8 mt-4 sm:mt-8">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/admin")}
          className="!mb-6 !normal-case !text-slate-600 dark:!text-slate-400"
        >
          {t("home.admin.services.backToPanel")}
        </Button>

        <Box className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Box className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                <AssignmentRounded className="text-rose-600 !text-xl" />
              </div>
              <Typography
                variant="h4"
                component="h1"
                className="!font-extrabold !text-slate-900 dark:!text-white"
              >
                {t("home.admin.services.enrollments.title")}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              className="!text-slate-600 dark:!text-slate-400"
            >
              {t("home.admin.services.enrollments.desc")}
            </Typography>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <TextField
              placeholder={t("adminEnrollments.searchPlaceholder")}
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-72"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded className="text-slate-400" />
                  </InputAdornment>
                ),
                className:
                  "!rounded-[1.5rem] !bg-white dark:!bg-slate-900 !border-none shadow-sm shadow-slate-200/50 dark:shadow-none",
              }}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
            />
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={openAddDialog}
              className="!rounded-xl !py-2.5 !px-6 !normal-case !font-bold !bg-rose-600 hover:!bg-rose-700 shadow-lg shadow-rose-500/20"
            >
              {t("adminEnrollments.addBtn")}
            </Button>
          </div>
        </Box>

        <Box className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setFilterStatus(key); setPage(0); }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                filterStatus === key
                  ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-400"
              }`}
            >
              {label}
            </button>
          ))}
        </Box>

        <Card
          elevation={0}
          className="rounded-3xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
        >
          {loading ? (
            <Box className="flex justify-center py-24">
              <CircularProgress className="!text-rose-500" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead className="bg-slate-50 dark:!bg-slate-800/80">
                  <TableRow>
                    <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">
                      {t("adminEnrollments.tableStudent")}
                    </TableCell>
                    <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">
                      {t("adminEnrollments.tableLenda")}
                    </TableCell>
                    <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">
                      {t("adminEnrollments.tableGrupi")}
                    </TableCell>
                    <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">
                      {t("adminEnrollments.tableProgress")}
                    </TableCell>
                    <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">
                      {t("adminEnrollments.tableStatus")}
                    </TableCell>
                    <TableCell className="!font-bold !text-slate-700 dark:!text-slate-200">
                      {t("adminEnrollments.tableDate")}
                    </TableCell>
                    <TableCell
                      align="right"
                      className="!font-bold !text-slate-700 dark:!text-slate-200"
                    >
                      {t("adminEnrollments.tableActions")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Box className="flex flex-col items-center justify-center py-20 gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                            <AssignmentOutlinedIcon className="!text-4xl text-rose-400" />
                          </div>
                          <Typography className="!font-semibold !text-slate-500">
                            {t("adminEnrollments.noData")}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((enr) => {
                      const cfg =
                        STATUS_CONFIG[enr.statusi] || STATUS_CONFIG.AKTIV;
                      const Icon = cfg.icon;
                      return (
                        <TableRow key={enr.id} hover>
                          <TableCell>
                            <Box className="flex items-center gap-3">
                              <Avatar className="!w-9 !h-9 !text-sm !bg-gradient-to-br from-rose-500 to-pink-600 !font-bold">
                                {enr.userEmri?.charAt(0)}
                              </Avatar>
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                                  {enr.userEmri}
                                </p>
                                <p className="text-xs text-slate-500">
                                  ID: {enr.userId}
                                </p>
                              </div>
                            </Box>
                          </TableCell>
                          <TableCell className="!text-slate-700 dark:!text-slate-300 !font-medium max-w-[200px]">
                            <p className="truncate">{enr.subjectTitulli}</p>
                          </TableCell>
                          <TableCell className="!text-slate-600 dark:!text-slate-300 !text-sm">
                            <p className="font-semibold">
                              {enr.subjectGroupName || "-"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {enr.subjectSubgroupName
                                ? `${enr.subjectSubgroupName}${enr.assistantName ? ` - ${enr.assistantName}` : ""}`
                                : enr.professorName || ""}
                            </p>
                          </TableCell>
                          <TableCell className="!text-slate-700 dark:!text-slate-300">
                            {enr.progresi != null ? `${enr.progresi}%` : "—"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}
                            >
                              <Icon className="!text-sm" />
                              {cfg.label}
                            </span>
                          </TableCell>
                          <TableCell className="!text-slate-500 !text-sm">
                            {enr.dataRegjistrimit
                              ? new Date(enr.dataRegjistrimit).toLocaleString()
                              : "—"}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              className="!text-slate-400 hover:!text-amber-600"
                              onClick={() => openEditDialog(enr)}
                            >
                              <EditRounded fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              className="!text-slate-400 hover:!text-rose-600"
                              onClick={() => {
                                setDeleteTarget(enr);
                                setOpenDeleteConfirm(true);
                              }}
                            >
                              <DeleteRounded fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {!loading && (
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          )}
        </Card>
      </Container>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: "2rem",
            p: 2,
            backgroundColor: "var(--mui-palette-background-paper)",
          },
        }}
      >
        <DialogTitle className="!px-6 !pt-6 !pb-2">
          <Typography
            variant="h5"
            className="!font-black !text-slate-900 dark:!text-white"
          >
            {isEdit ? t("adminEnrollments.editDialogTitle") : t("adminEnrollments.addDialogTitle")}
          </Typography>
        </DialogTitle>
        <DialogContent className="!px-6 !py-4">
          <Box className="flex flex-col gap-4 mt-2">
            {!isEdit ? (
              <>
                <FormControl fullWidth>
                  <InputLabel id="select-user-label">{t("adminEnrollments.fieldStudent")}</InputLabel>
                  <Select
                    labelId="select-user-label"
                    value={formData.userId}
                    label={t("adminEnrollments.fieldStudent")}
                    onChange={handleFieldChange("userId")}
                  >
                    <MenuItem value="">{t("adminEnrollments.chooseOption")}</MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.emri} {user.mbiemri} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="select-subject-label">{t("adminEnrollments.fieldLenda")}</InputLabel>
                  <Select
                    labelId="select-subject-label"
                    value={formData.subjectId}
                    label={t("adminEnrollments.fieldLenda")}
                    onChange={handleFieldChange("subjectId")}
                  >
                    <MenuItem value="">{t("adminEnrollments.chooseOption")}</MenuItem>
                    {subjects.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.titulli}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {subjectGroups.length > 0 && (
                  <>
                    <FormControl fullWidth>
                      <InputLabel id="select-group-label">{t("adminEnrollments.fieldGrupi")}</InputLabel>
                      <Select
                        labelId="select-group-label"
                        value={formData.subjectGroupId}
                        label={t("adminEnrollments.fieldGrupi")}
                        onChange={handleFieldChange("subjectGroupId")}
                      >
                        <MenuItem value="">{t("adminEnrollments.chooseOption")}</MenuItem>
                        {subjectGroups.map((group) => (
                          <MenuItem key={group.id} value={group.id}>
                            {group.name}
                            {group.teachers?.length
                              ? ` - ${group.teachers.map((tc) => tc.name).join(", ")}`
                              : ""}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={!formData.subjectGroupId}>
                      <InputLabel id="select-subgroup-label">
                        {t("adminEnrollments.fieldSubgroup")}
                      </InputLabel>
                      <Select
                        labelId="select-subgroup-label"
                        value={formData.subjectSubgroupId}
                        label={t("adminEnrollments.fieldSubgroup")}
                        onChange={handleFieldChange("subjectSubgroupId")}
                      >
                        <MenuItem value="">{t("adminEnrollments.noSubgroup")}</MenuItem>
                        {availableSubgroups.map((subgroup) => (
                          <MenuItem key={subgroup.id} value={subgroup.id}>
                            {subgroup.name}
                            {subgroup.assistants?.length
                              ? ` - ${subgroup.assistants.map((a) => a.name).join(", ")}`
                              : ""}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}
                <TextField
                  label={t("adminEnrollments.fieldEnrollmentKey")}
                  fullWidth
                  value={formData.enrollmentKey}
                  onChange={handleFieldChange("enrollmentKey")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />
              </>
            ) : (
              <>
                <TextField
                  label={t("adminEnrollments.fieldProgress")}
                  fullWidth
                  type="number"
                  value={formData.progresi}
                  onChange={handleFieldChange("progresi")}
                  inputProps={{ min: 0, max: 100 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel id="select-status-label">{t("adminEnrollments.fieldStatus")}</InputLabel>
                  <Select
                    labelId="select-status-label"
                    value={formData.statusi}
                    label={t("adminEnrollments.fieldStatus")}
                    onChange={handleFieldChange("statusi")}
                  >
                    <MenuItem value="AKTIV">{t("adminEnrollments.statusActive")}</MenuItem>
                    <MenuItem value="PERFUNDUAR">{t("adminEnrollments.statusCompleted")}</MenuItem>
                    <MenuItem value="ANULUAR">{t("adminEnrollments.statusCancelled")}</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions className="!p-4 gap-2">
          <Button
            onClick={() => setOpenDialog(false)}
            className="!rounded-xl !normal-case !text-slate-600"
          >
            {t("adminEnrollments.cancel")}
          </Button>
          <Button
            variant="contained"
            disabled={
              submitting ||
              (!isEdit
                ? !formData.userId ||
                  !formData.subjectId ||
                  (subjectGroups.length > 0 && !formData.subjectGroupId) ||
                  (availableSubgroups.length > 0 && !formData.subjectSubgroupId)
                : false)
            }
            onClick={handleSubmit}
            className="!rounded-xl !normal-case !font-bold !bg-rose-600 hover:!bg-rose-700"
          >
            {submitting
              ? t("adminEnrollments.saving")
              : isEdit
                ? t("adminEnrollments.saveChanges")
                : t("adminEnrollments.createEnrollment")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Zoom}
      >
        <DialogTitle className="!px-6 !pt-6 !pb-2">
          <Typography
            variant="h5"
            className="!font-black !text-slate-900 dark:!text-white"
          >
            {t("adminEnrollments.deleteTitle")}
          </Typography>
        </DialogTitle>
        <DialogContent className="!px-6 !py-4">
          <Typography className="!text-slate-600 dark:!text-slate-300">
            {t("adminEnrollments.deleteBodyPrefix")} "{deleteTarget?.userEmri}"?
          </Typography>
        </DialogContent>
        <DialogActions className="!p-4 gap-2">
          <Button
            onClick={() => setOpenDeleteConfirm(false)}
            className="!rounded-xl !normal-case !text-slate-600"
          >
            {t("adminEnrollments.cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={submitting}
            className="!rounded-xl !normal-case !font-bold"
          >
            {submitting ? t("adminEnrollments.deleting") : t("adminEnrollments.deleteBtn")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Zoom}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: "1.25rem",
            fontWeight: "bold",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Footer />
    </section>
  );
}

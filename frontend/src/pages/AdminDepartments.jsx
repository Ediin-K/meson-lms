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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Zoom,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import CategoryRounded from "@mui/icons-material/CategoryRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import Footer from "../components/ui/Footer";
import { getDepartmentGroups } from "../services/departmentGroupService";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/departmentService";

const EMPTY_FORM = { emertimi: "", pershkrimi: "", numSemesters: 6 };

export default function AdminDepartments() {
  const navigate = useNavigate();
  const { t, mode } = useAppPreferences();
  const isDark = mode === "dark";

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [groupsDialog, setGroupsDialog] = useState({ open: false, department: null });
  const [departmentGroups, setDepartmentGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsSemester, setGroupsSemester] = useState(1);

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

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (error) {
      showToast(
        getErrorMessage(error, t("adminDepartments.toast.fetchError")),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const filteredDepartments = departments.filter(
    (department) =>
      department.emertimi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.pershkrimi?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openAddDialog = () => {
    setIsEdit(false);
    setSelectedDepartment(null);
    setFormData(EMPTY_FORM);
    setOpenDialog(true);
  };

  const openGroupsDialog = async (department) => {
    setGroupsDialog({ open: true, department });
    setGroupsLoading(true);
    try {
      setDepartmentGroups(await getDepartmentGroups(department.id, groupsSemester));
    } catch (error) {
      showToast(getErrorMessage(error, t("adminDepartments.toast.groupsError")), "error");
    } finally {
      setGroupsLoading(false);
    }
  };

  const openEditDialog = (department) => {
    setIsEdit(true);
    setSelectedDepartment(department);
    setFormData({
      emertimi: department.emertimi || "",
      pershkrimi: department.pershkrimi || "",
      numSemesters: department.numSemesters ?? 6,
    });
    setOpenDialog(true);
  };

  const handleFieldChange = (key) => (event) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.emertimi.trim()) {
      showToast(t("adminDepartments.toast.nameRequired"), "error");
      return;
    }
    const numSemesters = parseInt(formData.numSemesters, 10);
    if (!numSemesters || numSemesters < 1 || numSemesters > 12) {
      showToast(t("adminDepartments.toast.semesterRange"), "error");
      return;
    }

    const payload = { ...formData, numSemesters };

    setSubmitting(true);

    try {
      if (isEdit && selectedDepartment) {
        await updateDepartment(selectedDepartment.id, payload);
        showToast(t("adminDepartments.toast.updated"), "success");
      } else {
        await createDepartment(payload);
        showToast(t("adminDepartments.toast.created"), "success");
      }
      setOpenDialog(false);
      await loadDepartments();
    } catch (error) {
      showToast(
        getErrorMessage(error, t("adminDepartments.toast.saveError")),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);

    try {
      await deleteDepartment(deleteTarget.id);
      showToast(t("adminDepartments.toast.deleted"), "success");
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      await loadDepartments();
    } catch (error) {
      showToast(
        getErrorMessage(error, t("adminDepartments.toast.deleteError")),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
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

        <Box className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Box className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <CategoryRounded className="text-amber-600 text-xl!" />
              </div>
              <Typography
                variant="h4"
                component="h1"
                className="font-extrabold! text-slate-900! dark:text-white!"
              >
                {t("home.admin.services.departments.title")}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              className="text-slate-600! dark:text-slate-400!"
            >
              {t("home.admin.services.departments.desc")}
            </Typography>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <TextField
              placeholder={t("adminDepartments.searchPlaceholder")}
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded className="text-slate-400" />
                  </InputAdornment>
                ),
                className:
                  "rounded-3xl! bg-white! dark:bg-slate-900! border-none! shadow-sm shadow-slate-200/50 dark:shadow-none",
              }}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                input: {
                  color: isDark ? "#f8fafc" : "#0f172a",
                  "&::placeholder": {
                    color: isDark
                      ? "rgba(226,232,240,0.7)"
                      : "rgba(100,116,139,0.75)",
                  },
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={openAddDialog}
              className="rounded-xl! py-2.5! px-6! normal-case! font-bold! bg-amber-600! hover:bg-amber-700! shadow-lg shadow-amber-500/20"
            >
              {t("adminDepartments.addBtn")}
            </Button>
          </div>
        </Box>

        <Card
          elevation={0}
          className="rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900/60! dark:border-slate-700/80! overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
        >
          {loading ? (
            <Box className="flex justify-center py-24">
              <CircularProgress className="text-amber-500!" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead className="bg-slate-50 dark:bg-slate-800/80!">
                  <TableRow>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">
                      {t("adminDepartments.tableEmri")}
                    </TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">
                      {t("adminDepartments.tablePershkrimi")}
                    </TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">
                      {t("adminDepartments.tableSemestra")}
                    </TableCell>
                    <TableCell
                      align="right"
                      className="font-bold! text-slate-700! dark:text-slate-200!"
                    >
                      {t("adminDepartments.tableVeprime")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDepartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Box className="flex flex-col items-center justify-center py-20 gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            <CategoryOutlinedIcon className="text-4xl! text-amber-400" />
                          </div>
                          <Typography className="font-semibold! text-slate-500!">
                            {t("adminDepartments.noData")}
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<AddRounded />}
                            onClick={openAddDialog}
                            className="rounded-xl! normal-case! border-amber-300! text-amber-600!"
                          >
                            {t("adminDepartments.addFirst")}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDepartments.map((department) => (
                      <TableRow key={department.id} hover>
                        <TableCell className="font-semibold! text-slate-800! dark:text-slate-100!">
                          {department.emertimi}
                        </TableCell>
                        <TableCell className="text-slate-500! text-sm!">
                          {department.pershkrimi || "—"}
                        </TableCell>
                        <TableCell className="text-slate-700! dark:text-slate-200! font-semibold! text-sm!">
                          {department.numSemesters ?? "—"}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => openGroupsDialog(department)}
                            className="text-slate-400! hover:text-indigo-600!"
                            title={t("adminDepartments.tooltipGroups")}
                          >
                            <GroupsRounded fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(department)}
                            className="text-slate-400! hover:text-amber-600!"
                          >
                            <EditRounded fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setDeleteTarget(department);
                              setOpenDeleteConfirm(true);
                            }}
                            className="text-slate-400! hover:text-rose-600!"
                          >
                            <DeleteRounded fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: "2.5rem",
              p: 2,
              backgroundColor: isDark ? "#0f172a" : "white",
              border: isDark
                ? "1px solid #1e293b"
                : "1px solid rgba(148,163,184,0.15)",
              boxShadow: isDark
                ? "0 30px 60px rgba(15,23,42,0.65)"
                : "0 30px 60px rgba(148,163,184,0.15)",
            },
          }}
        >
          <DialogTitle className="px-6! pt-6! pb-2!">
            <Typography
              variant="h5"
              className={
                isDark
                  ? "font-black! text-white!"
                  : "font-black! text-slate-900!"
              }
            >
              {isEdit ? t("adminDepartments.editDialogTitle") : t("adminDepartments.addDialogTitle")}
            </Typography>
          </DialogTitle>
          <DialogContent
            className={`!px-6 py-4! ${isDark ? "bg-slate-900/20!" : ""}`}
          >
            <Box className="flex flex-col gap-4 mt-2">
              <TextField
                label={t("adminDepartments.fieldEmertimi")}
                fullWidth
                value={formData.emertimi}
                onChange={handleFieldChange("emertimi")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": {
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#475569" : "#cbd5e1",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#cbd5e1" : "#64748b",
                  },
                }}
              />
              <TextField
                label={t("adminDepartments.fieldPershkrimi")}
                fullWidth
                multiline
                rows={4}
                value={formData.pershkrimi}
                onChange={handleFieldChange("pershkrimi")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": {
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#475569" : "#cbd5e1",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#cbd5e1" : "#64748b",
                  },
                }}
              />
              <TextField
                label={t("adminDepartments.fieldNumSemesters")}
                fullWidth
                type="number"
                inputProps={{ min: 1, max: 12 }}
                value={formData.numSemesters}
                onChange={handleFieldChange("numSemesters")}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    "& fieldset": {
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#475569" : "#cbd5e1",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#cbd5e1" : "#64748b",
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions className="p-4! gap-2">
            <Button
              onClick={() => setOpenDialog(false)}
              className="rounded-xl! normal-case! text-slate-600!"
            >
              {t("adminDepartments.cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={submitting || !formData.emertimi.trim()}
              onClick={handleSubmit}
              className="rounded-xl! normal-case! font-bold! bg-amber-600! hover:bg-amber-700!"
            >
              {submitting
                ? t("adminDepartments.saving")
                : isEdit
                  ? t("adminDepartments.saveChanges")
                  : t("adminDepartments.addDept")}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={groupsDialog.open}
          onClose={() => setGroupsDialog({ open: false, department: null })}
          maxWidth="md"
          fullWidth
          TransitionComponent={Zoom}
        >
          <DialogTitle>
            <Typography variant="h5" className="font-black! dark:text-white!">
              {t("adminDepartments.groupsDialogTitle")}
            </Typography>
            <Typography variant="body2" className="text-slate-500!">
              {groupsDialog.department?.emertimi}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box className="flex flex-wrap gap-3 mb-4 mt-2 items-center">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>{t("adminDepartments.semesterLabel")}</InputLabel>
                <Select
                  label={t("adminDepartments.semesterLabel")}
                  value={groupsSemester}
                  onChange={(e) => {
                    setGroupsSemester(Number(e.target.value));
                    if (groupsDialog.department) {
                      setGroupsLoading(true);
                      getDepartmentGroups(groupsDialog.department.id, Number(e.target.value))
                        .then(setDepartmentGroups)
                        .catch(() => showToast(t("adminDepartments.toast.error"), "error"))
                        .finally(() => setGroupsLoading(false));
                    }
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <MenuItem key={s} value={s}>
                      {t("adminDepartments.semesterLabel")} {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                size="small"
                variant="contained"
                onClick={() => navigate("/admin/groups")}
                className="!rounded-xl !normal-case !font-bold !bg-sky-600"
              >
                {t("adminDepartments.createManageGroups")}
              </Button>
            </Box>
            <Alert severity="info" className="!mb-4 !rounded-2xl">
              {t("adminDepartments.groupsInfoAlert")}
            </Alert>
            {groupsLoading ? (
              <Box className="flex justify-center py-8"><CircularProgress /></Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell className="font-bold!">{t("adminDepartments.groupsTableGrupi")}</TableCell>
                      <TableCell className="font-bold!">{t("adminDepartments.groupsTableCapacity")}</TableCell>
                      <TableCell className="font-bold!">{t("adminDepartments.groupsTableStudents")}</TableCell>
                      <TableCell align="right" className="font-bold!">{t("adminDepartments.groupsTableActions")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentGroups.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-semibold!">{g.name}</TableCell>
                        <TableCell>{g.maxCapacity}</TableCell>
                        <TableCell>
                          {g.currentStudents}/{g.maxCapacity}
                          {g.isFull && ` ${t("adminDepartments.full")}`}
                        </TableCell>
                        <TableCell align="right">
                          <Chip size="small" label={g.status || "ACTIVE"} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {departmentGroups.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-slate-400! text-center! py-6!">
                          {t("adminDepartments.noGroups")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGroupsDialog({ open: false, department: null })} className="rounded-xl! normal-case!">
              {t("adminDepartments.close")}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDeleteConfirm}
          onClose={() => setOpenDeleteConfirm(false)}
          maxWidth="xs"
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: "2rem",
              p: 2,
              backgroundColor: isDark ? "#0f172a" : "white",
              border: isDark
                ? "1px solid #1e293b"
                : "1px solid rgba(148,163,184,0.15)",
            },
          }}
        >
          <DialogTitle className="px-6! pt-6! pb-2!">
            <Typography
              variant="h5"
              className={
                isDark
                  ? "font-black! text-white!"
                  : "font-black! text-slate-900!"
              }
            >
              {t("adminDepartments.deleteTitle")}
            </Typography>
          </DialogTitle>
          <DialogContent
            className={`!px-6 py-4! ${isDark ? "bg-slate-900/20!" : ""}`}
          >
            <Typography className="text-slate-600! dark:text-slate-300!">
              {t("adminDepartments.deleteBody")} "{deleteTarget?.emertimi}"?
            </Typography>
          </DialogContent>
          <DialogActions className="p-4! gap-2">
            <Button
              onClick={() => setOpenDeleteConfirm(false)}
              className="rounded-xl! normal-case! text-slate-600!"
            >
              {t("adminDepartments.cancel")}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={submitting}
              className="rounded-xl! normal-case! font-bold!"
            >
              {submitting ? t("adminDepartments.deletingBtn") : t("adminDepartments.deleteBtn")}
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
      </Container>
      <Footer />
    </section>
  );
}

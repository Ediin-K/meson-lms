import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../context/appPreferencesContext";
import {
  Typography,
  Container,
  Box,
  Card,
  TextField,
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
  Chip,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import Footer from "../components/ui/Footer";
import {
  getAllAcademicTerms,
  createAcademicTerm,
  updateAcademicTerm,
  activateAcademicTerm,
  deleteAcademicTerm,
} from "../services/academicTermService";

const EMPTY_FORM = {
  name: "",
  enrollmentStart: "",
  enrollmentEnd: "",
  examApplicationStart: "",
  examApplicationEnd: "",
};

export default function AdminAcademicTerms() {
  const navigate = useNavigate();
  const { t, mode } = useAppPreferences();
  const isDark = mode === "dark";

  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [activatingId, setActivatingId] = useState(null);
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

  const loadTerms = useCallback(async () => {
    setLoading(true);
    try {
      setTerms(await getAllAcademicTerms());
    } catch (error) {
      showToast(getErrorMessage(error, t("adminAcademicTerms.toast.fetchError")), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  const openAddDialog = () => {
    setIsEdit(false);
    setSelectedTerm(null);
    setFormData(EMPTY_FORM);
    setOpenDialog(true);
  };

  const openEditDialog = (term) => {
    setIsEdit(true);
    setSelectedTerm(term);
    setFormData({
      name: term.name || "",
      enrollmentStart: term.enrollmentStart?.slice(0, 16) || "",
      enrollmentEnd: term.enrollmentEnd?.slice(0, 16) || "",
      examApplicationStart: term.examApplicationStart?.slice(0, 16) || "",
      examApplicationEnd: term.examApplicationEnd?.slice(0, 16) || "",
    });
    setOpenDialog(true);
  };

  const handleFieldChange = (key) => (event) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const isFormValid =
    formData.name.trim() &&
    formData.enrollmentStart &&
    formData.enrollmentEnd &&
    formData.examApplicationStart &&
    formData.examApplicationEnd;

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast(t("adminAcademicTerms.toast.nameRequired"), "error");
      return;
    }
    if (formData.enrollmentStart >= formData.enrollmentEnd
      || formData.examApplicationStart >= formData.examApplicationEnd) {
      showToast(t("adminAcademicTerms.toast.windowInvalid"), "error");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && selectedTerm) {
        await updateAcademicTerm(selectedTerm.id, formData);
        showToast(t("adminAcademicTerms.toast.updated"), "success");
      } else {
        await createAcademicTerm(formData);
        showToast(t("adminAcademicTerms.toast.created"), "success");
      }
      setOpenDialog(false);
      await loadTerms();
    } catch (error) {
      showToast(getErrorMessage(error, t("adminAcademicTerms.toast.saveError")), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (term) => {
    setActivatingId(term.id);
    try {
      await activateAcademicTerm(term.id);
      showToast(t("adminAcademicTerms.toast.activated"), "success");
      await loadTerms();
    } catch (error) {
      showToast(getErrorMessage(error, t("adminAcademicTerms.toast.activateError")), "error");
    } finally {
      setActivatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteAcademicTerm(deleteTarget.id);
      showToast(t("adminAcademicTerms.toast.deleted"), "success");
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      await loadTerms();
    } catch (error) {
      showToast(getErrorMessage(error, t("adminAcademicTerms.toast.deleteError")), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatRange = (start, end) => {
    const fmt = (v) => (v ? new Date(v).toLocaleString() : "—");
    return `${fmt(start)} → ${fmt(end)}`;
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
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <EventAvailableRounded className="text-indigo-600 text-xl!" />
              </div>
              <Typography variant="h4" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
                {t("home.admin.services.academicTerms.title")}
              </Typography>
            </Box>
            <Typography variant="body1" className="text-slate-600! dark:text-slate-400!">
              {t("home.admin.services.academicTerms.desc")}
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={openAddDialog}
            className="rounded-xl! py-2.5! px-6! normal-case! font-bold! bg-indigo-600! hover:bg-indigo-700! shadow-lg shadow-indigo-500/20"
          >
            {t("adminAcademicTerms.addBtn")}
          </Button>
        </Box>

        <Card
          elevation={0}
          className="rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900/60! dark:border-slate-700/80! overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
        >
          {loading ? (
            <Box className="flex justify-center py-24">
              <CircularProgress className="text-indigo-500!" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead className="bg-slate-50 dark:bg-slate-800/80!">
                  <TableRow>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminAcademicTerms.tableName")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminAcademicTerms.tableStatus")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminAcademicTerms.tableEnrollmentWindow")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminAcademicTerms.tableExamWindow")}</TableCell>
                    <TableCell align="right" className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminAcademicTerms.tableActions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {terms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box className="flex flex-col items-center justify-center py-20 gap-4">
                          <Typography className="font-semibold! text-slate-500!">
                            {t("adminAcademicTerms.noData")}
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<AddRounded />}
                            onClick={openAddDialog}
                            className="rounded-xl! normal-case! border-indigo-300! text-indigo-600!"
                          >
                            {t("adminAcademicTerms.addFirst")}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    terms.map((term) => (
                      <TableRow key={term.id} hover>
                        <TableCell className="font-semibold! text-slate-800! dark:text-slate-100!">
                          {term.name}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={term.active ? t("adminAcademicTerms.activeChip") : t("adminAcademicTerms.inactiveChip")}
                            color={term.active ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell className="text-slate-500! text-sm!">
                          {formatRange(term.enrollmentStart, term.enrollmentEnd)}
                        </TableCell>
                        <TableCell className="text-slate-500! text-sm!">
                          {formatRange(term.examApplicationStart, term.examApplicationEnd)}
                        </TableCell>
                        <TableCell align="right">
                          <Box className="flex justify-end items-center gap-1">
                            {!term.active && (
                              <IconButton
                                size="small"
                                disabled={activatingId === term.id}
                                onClick={() => handleActivate(term)}
                                className="text-slate-400! hover:text-emerald-600!"
                                title={t("adminAcademicTerms.tooltipActivate")}
                              >
                                <CheckCircleRounded fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(term)}
                              className="text-slate-400! hover:text-indigo-600!"
                            >
                              <EditRounded fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              disabled={term.active}
                              title={term.active ? t("adminAcademicTerms.toast.activateError") : undefined}
                              onClick={() => {
                                setDeleteTarget(term);
                                setOpenDeleteConfirm(true);
                              }}
                              className="text-slate-400! hover:text-rose-600!"
                            >
                              <DeleteRounded fontSize="small" />
                            </IconButton>
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
              border: isDark ? "1px solid #1e293b" : "1px solid rgba(148,163,184,0.15)",
              boxShadow: isDark ? "0 30px 60px rgba(15,23,42,0.65)" : "0 30px 60px rgba(148,163,184,0.15)",
            },
          }}
        >
          <DialogTitle className="px-6! pt-6! pb-2!">
            <Typography variant="h5" className={isDark ? "font-black! text-white!" : "font-black! text-slate-900!"}>
              {isEdit ? t("adminAcademicTerms.editDialogTitle") : t("adminAcademicTerms.addDialogTitle")}
            </Typography>
          </DialogTitle>
          <DialogContent className={`!px-6 py-4! ${isDark ? "bg-slate-900/20!" : ""}`}>
            <Box className="flex flex-col gap-4 mt-2">
              <TextField
                label={t("adminAcademicTerms.fieldName")}
                fullWidth
                value={formData.name}
                onChange={handleFieldChange("name")}
              />
              <TextField
                label={t("adminAcademicTerms.fieldEnrollmentStart")}
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.enrollmentStart}
                onChange={handleFieldChange("enrollmentStart")}
              />
              <TextField
                label={t("adminAcademicTerms.fieldEnrollmentEnd")}
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.enrollmentEnd}
                onChange={handleFieldChange("enrollmentEnd")}
              />
              <TextField
                label={t("adminAcademicTerms.fieldExamApplicationStart")}
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.examApplicationStart}
                onChange={handleFieldChange("examApplicationStart")}
              />
              <TextField
                label={t("adminAcademicTerms.fieldExamApplicationEnd")}
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.examApplicationEnd}
                onChange={handleFieldChange("examApplicationEnd")}
              />
            </Box>
          </DialogContent>
          <DialogActions className="p-4! gap-2">
            <Button onClick={() => setOpenDialog(false)} className="rounded-xl! normal-case! text-slate-600!">
              {t("adminAcademicTerms.cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={submitting || !isFormValid}
              onClick={handleSubmit}
              className="rounded-xl! normal-case! font-bold! bg-indigo-600! hover:bg-indigo-700!"
            >
              {submitting
                ? t("adminAcademicTerms.saving")
                : isEdit
                  ? t("adminAcademicTerms.saveChanges")
                  : t("adminAcademicTerms.addTerm")}
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
              border: isDark ? "1px solid #1e293b" : "1px solid rgba(148,163,184,0.15)",
            },
          }}
        >
          <DialogTitle className="px-6! pt-6! pb-2!">
            <Typography variant="h5" className={isDark ? "font-black! text-white!" : "font-black! text-slate-900!"}>
              {t("adminAcademicTerms.deleteTitle")}
            </Typography>
          </DialogTitle>
          <DialogContent className={`!px-6 py-4! ${isDark ? "bg-slate-900/20!" : ""}`}>
            <Typography className="text-slate-600! dark:text-slate-300!">
              {t("adminAcademicTerms.deleteBody")} "{deleteTarget?.name}"?
            </Typography>
          </DialogContent>
          <DialogActions className="p-4! gap-2">
            <Button onClick={() => setOpenDeleteConfirm(false)} className="rounded-xl! normal-case! text-slate-600!">
              {t("adminAcademicTerms.cancel")}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={submitting}
              className="rounded-xl! normal-case! font-bold!"
            >
              {submitting ? t("adminAcademicTerms.deletingBtn") : t("adminAcademicTerms.deleteBtn")}
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
            sx={{ width: "100%", borderRadius: "1.25rem", fontWeight: "bold", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
      <Footer />
    </section>
  );
}

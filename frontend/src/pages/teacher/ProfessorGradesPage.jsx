import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import GradeRounded from "@mui/icons-material/GradeRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import GradesPageShell from "../../components/grades/GradesPageShell";
import GradeTable from "../../components/grades/GradeTable";
import GradeFormDialog from "../../components/grades/GradeFormDialog";
import teacherContentService from "../../services/teacherContentService";
import { useAppPreferences } from "../../context/appPreferencesContext";
import {
  getGradesBySubject,
  createGrade,
  updateGrade,
  deleteGrade,
} from "../../services/gradeService";

export default function ProfessorGradesPage() {
  const { colorMode, t } = useAppPreferences();
  const isDark = colorMode === "dark";
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editGrade, setEditGrade] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

  const loadSubjects = useCallback(async () => {
    try {
      const res = await teacherContentService.getSubjects();
      setSubjects(res.data || []);
    } catch (error) {
      showToast(getErrorMessage(error, t("professorGrades.toast.fetchSubjectsError")), "error");
    }
  }, []);

  const loadSubjectData = useCallback(async (subjectId) => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const [gradesData, studentsRes] = await Promise.all([
        getGradesBySubject(subjectId),
        teacherContentService.getStudentsBySubject(subjectId),
      ]);
      setGrades(gradesData || []);
      setStudents(studentsRes.data || []);
    } catch (error) {
      showToast(getErrorMessage(error, t("professorGrades.toast.fetchDataError")), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadSubjectData(selectedSubjectId);
    } else {
      setGrades([]);
      setStudents([]);
    }
  }, [selectedSubjectId, loadSubjectData]);

  const filteredGrades = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return grades.filter((g) => {
      const studentName = `${g.studentEmri || ""} ${g.studentMbiemri || ""}`.toLowerCase();
      const comment = (g.comment || "").toLowerCase();
      return studentName.includes(term) || comment.includes(term);
    });
  }, [grades, searchTerm]);

  const studentsWithoutGrade = useMemo(() => {
    const gradedIds = new Set(grades.map((g) => g.studentId));
    return students.filter((s) => !gradedIds.has(s.userId));
  }, [students, grades]);

  const selectedSubject = subjects.find((c) => String(c.id) === String(selectedSubjectId));

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editGrade?.id) {
        await updateGrade(editGrade.id, data);
        showToast(t("professorGrades.toast.updated"));
      } else {
        await createGrade(data);
        showToast(t("professorGrades.toast.created"));
      }
      setOpenForm(false);
      await loadSubjectData(selectedSubjectId);
    } catch (error) {
      showToast(getErrorMessage(error, t("professorGrades.toast.saveError")), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteGrade(deleteTarget.id);
      showToast(t("professorGrades.toast.deleted"));
      setDeleteTarget(null);
      await loadSubjectData(selectedSubjectId);
    } catch (error) {
      showToast(getErrorMessage(error, t("professorGrades.toast.deleteError")), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toolbarActions = (
    <Button
      variant="contained"
      startIcon={<AddRounded />}
      onClick={() => { setEditGrade(null); setOpenForm(true); }}
      disabled={!selectedSubjectId}
      className="!rounded-lg !normal-case !bg-[#2563eb] !shadow-none hover:!bg-[#1d4ed8]"
    >
      {t("professorGrades.addGradeBtn")}
    </Button>
  );

  return (
    <GradesPageShell
      backTo="/teacher"
      backLabel={t("professorGrades.backToPanel")}
      breadcrumbs={[
        { label: t("professorGrades.panelTitle"), to: "/teacher" },
        { label: t("professorGrades.gradesTitle") },
      ]}
      title={t("professorGrades.manageTitle")}
      subtitle={t("professorGrades.subtitle")}
      icon={GradeRounded}
      actions={toolbarActions}
    >
      <Box className="mb-5 rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
        <Box className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <FormControl size="small" className="w-full lg:max-w-xs" required>
            <InputLabel>{t("professorGrades.subjectLabel")}</InputLabel>
            <Select
              value={selectedSubjectId}
              label={t("professorGrades.subjectLabel")}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
            >
              <MenuItem value="">
                <em>{t("professorGrades.chooseSubject")}</em>
              </MenuItem>
              {subjects.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.titulli} ({c.ects ?? 5} ECTS)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder={t("professorGrades.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!selectedSubjectId}
            className="w-full lg:flex-1"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" className="text-slate-400" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: isDark ? "#1e293b" : "#f8fafc",
                borderRadius: "8px",
                color: isDark ? "#e2e8f0" : "inherit",
              },
            }}
          />
        </Box>

        {selectedSubject && (
          <Box className="mt-4 flex flex-wrap gap-2">
            <Chip
              size="small"
              label={`${filteredGrades.length} ${t("professorGrades.chipGrades")}`}
              className="!bg-sky-100 !font-semibold !text-sky-800 dark:!bg-sky-950/60 dark:!text-sky-300"
            />
            <Chip
              size="small"
              label={`${studentsWithoutGrade.length} ${t("professorGrades.chipWithoutGrade")}`}
              className="!bg-amber-100 !font-semibold !text-amber-800 dark:!bg-amber-950/60 dark:!text-amber-300"
            />
            <Chip
              size="small"
              label={`${students.length} ${t("professorGrades.chipTotal")}`}
              variant="outlined"
              className="!font-semibold dark:!border-slate-600 dark:!text-slate-300"
            />
          </Box>
        )}
      </Box>

      {!selectedSubjectId ? (
        <Box className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-slate-400 bg-white px-6 text-center dark:border-slate-600 dark:bg-slate-900">
          <Typography className="!text-slate-600 dark:!text-slate-400">
            {t("professorGrades.noSubjectPrompt")}
          </Typography>
        </Box>
      ) : (
        <GradeTable
          rows={filteredGrades}
          mode="professor"
          loading={loading}
          onEdit={(row) => { setEditGrade(row); setOpenForm(true); }}
          onDelete={(row) => setDeleteTarget(row)}
        />
      )}

      <GradeFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        initialData={editGrade}
        students={editGrade ? students : studentsWithoutGrade.length ? studentsWithoutGrade : students}
        subjects={subjects}
        fixedSubjectId={selectedSubjectId ? Number(selectedSubjectId) : null}
        fixedSubjectTitle={selectedSubject?.titulli || ""}
        submitting={submitting}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} PaperProps={{ className: "rounded-xl" }}>
        <DialogTitle className="!font-bold">{t("professorGrades.deleteTitle")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("professorGrades.deleteBody")}{" "}
            <strong>{deleteTarget?.studentEmri} {deleteTarget?.studentMbiemri}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions className="!px-6 !pb-4">
          <Button onClick={() => setDeleteTarget(null)} className="!rounded-lg !normal-case">{t("professorGrades.cancel")}</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={submitting}
            className="!rounded-lg !normal-case"
          >
            {t("professorGrades.deleteBtn")}
          </Button>
        </DialogActions>
      </Dialog>

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

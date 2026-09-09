import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../../context/appPreferencesContext";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Tooltip,
  Zoom,
  Alert,
  Snackbar,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import AutoStoriesRounded from "@mui/icons-material/AutoStoriesRounded";
import Footer from "../../components/ui/Footer";
import axiosInstance from "../../services/axiosInstance";
import { getAllTeachers } from "../../services/teacherService";
import { getDashboard, getSubjects } from "../../services/departmentHeadService";

const SEMESTER_COLORS = {
  1: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  2: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  3: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  4: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  5: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  6: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

const EMPTY_FORM = {
  titulli: "",
  code: "",
  pershkrimi: "",
  teacherIds: [],
  semester: 1,
  enrollmentKey: "",
  ects: 5,
  statusi: "DRAFT",
};

export default function DepartmentHeadSubjects() {
  const navigate = useNavigate();
  const { t, mode } = useAppPreferences();
  const isDark = mode === "dark";

  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("adminSubjects.toast.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    getAllTeachers().then(setTeachers).catch(() => {});
    getDashboard().then(setDepartment).catch(() => {});
  }, []);

  const availableSemesters = Array.from({ length: 12 }, (_, i) => i + 1);

  const field = (k) => (e) => setFormData((f) => ({ ...f, [k]: e.target.value }));

  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedSubject(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (subject) => {
    setIsEdit(true);
    setSelectedSubject(subject);
    setFormData({
      titulli: subject.titulli,
      code: subject.code || "",
      pershkrimi: subject.pershkrimi,
      teacherIds: subject.teachers?.length
        ? subject.teachers.map((tc) => tc.id)
        : subject.teacherId ? [subject.teacherId] : [],
      semester: subject.semester,
      enrollmentKey: subject.enrollmentKey || "",
      ects: subject.ects ?? 5,
      statusi: subject.statusi,
    });
    setFormError(null);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!department?.departmentId) return;
    setSaving(true);
    setFormError(null);
    const payload = { ...formData, departmentId: department.departmentId };
    try {
      if (isEdit) {
        await axiosInstance.put(`/subjects/${selectedSubject.id}`, payload);
        setSnackbarMessage(t("adminSubjects.toast.updated"));
      } else {
        await axiosInstance.post("/subjects", payload);
        setSnackbarMessage(t("adminSubjects.toast.created"));
      }
      setOpenSnackbar(true);
      setOpenDialog(false);
      await fetchSubjects();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axiosInstance.delete(`/subjects/${deleteTarget.id}`);
      setSnackbarMessage(`${deleteTarget.titulli} ${t("adminSubjects.toast.deleted")}`);
      setOpenSnackbar(true);
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      await fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("adminSubjects.toast.deleteError"));
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const filtered = subjects.filter((s) =>
    (s.titulli?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 grow">
        <Box className="mb-8">
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate("/department-head")}
            className="rounded-2xl! px-6! py-2! normal-case! font-bold! text-slate-600! dark:text-slate-400! hover:bg-slate-200/50! dark:hover:bg-slate-800/50!"
          >
            {t("departmentHead.backToPanel")}
          </Button>
        </Box>
        <Box className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Typography variant="h4" component="h1" className="font-black! text-slate-900! dark:text-white!">
              {t("adminSubjects.title")}
            </Typography>
            <Typography variant="body1" className="mt-1! text-slate-500! dark:text-slate-400!">
              {t("adminSubjects.subtitle")}
            </Typography>
          </div>
          <Box className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <TextField
              placeholder={t("adminSubjects.searchPlaceholder")}
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-72"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded className="text-slate-400" />
                  </InputAdornment>
                ),
                className: "rounded-3xl! bg-white! dark:bg-slate-900! border-none! shadow-sm",
              }}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
            />
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={handleOpenAdd}
              className="rounded-2xl! py-3! px-6! normal-case! font-bold! bg-sky-600! hover:bg-sky-700! shadow-lg shadow-sky-500/20"
            >
              {t("adminSubjects.addTitle")}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" className="mb-6 rounded-2xl!" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

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
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminSubjects.table.title")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminSubjects.table.semester")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminSubjects.table.credits")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminSubjects.table.instructor")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminSubjects.table.status")}</TableCell>
                    <TableCell align="right" className="font-bold! text-slate-700! dark:text-slate-200!">{t("adminSubjects.table.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Box className="flex flex-col items-center justify-center py-20 gap-4">
                          <AutoStoriesRounded className="text-5xl! text-slate-200 dark:text-slate-700" />
                          <Typography className="font-semibold! text-slate-500!">{t("adminSubjects.noSubjects")}</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((subject) => (
                      <TableRow key={subject.id} hover>
                        <TableCell>
                          <Typography className="font-bold! text-slate-900! dark:text-white!">{subject.titulli}</Typography>
                          <Typography variant="caption" className="text-slate-500!">{subject.pershkrimi}</Typography>
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold ${SEMESTER_COLORS[subject.semester] || SEMESTER_COLORS[1]}`}>
                            {subject.semester}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-700! dark:text-slate-300! font-bold! text-sm!">{subject.ects ?? 5}</TableCell>
                        <TableCell className="text-slate-600! dark:text-slate-400! font-bold! text-sm!">{subject.teacherName}</TableCell>
                        <TableCell>
                          <Chip
                            label={subject.statusi}
                            size="small"
                            className={`!font-bold rounded-lg! ${subject.statusi === "AKTIV" ? "bg-emerald-100! text-emerald-700! dark:bg-emerald-900/30! dark:text-emerald-400!" : "bg-slate-100! text-slate-500! dark:bg-slate-800! dark:text-slate-400!"}`}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={t("adminSubjects.tooltips.edit")}>
                            <IconButton size="small" onClick={() => handleOpenEdit(subject)} className="text-slate-400! hover:text-sky-600!">
                              <EditRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("adminSubjects.tooltips.delete")}>
                            <IconButton
                              size="small"
                              onClick={() => { setDeleteTarget(subject); setOpenDeleteConfirm(true); }}
                              className="text-slate-400! hover:text-rose-600!"
                            >
                              <DeleteRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth TransitionComponent={Zoom}
        PaperProps={{ sx: { borderRadius: "2.5rem", p: 2, backgroundColor: isDark ? "#0f172a" : "white" } }}>
        <DialogTitle className="px-6! pt-6! pb-2!">
          <Typography variant="h5" className="font-black! text-slate-900! dark:text-white!">
            {isEdit ? t("adminSubjects.editTitle") : t("adminSubjects.addTitle")}
          </Typography>
        </DialogTitle>
        <DialogContent className="px-6! py-4!">
          {formError && <Alert severity="error" className="mb-4 rounded-2xl!" onClose={() => setFormError(null)}>{formError}</Alert>}
          <Box className="flex flex-col gap-5 mt-4">
            <TextField label={t("adminSubjects.form.titleLabel")} fullWidth value={formData.titulli} onChange={field("titulli")} />
            <TextField label={t("adminSubjects.form.codeLabel")} fullWidth value={formData.code} onChange={field("code")} />
            <TextField label={t("adminSubjects.form.description")} fullWidth multiline rows={3} value={formData.pershkrimi} onChange={field("pershkrimi")} />
            <FormControl fullWidth>
              <InputLabel>{t("adminSubjects.form.instructorId")}</InputLabel>
              <Select
                multiple
                label={t("adminSubjects.form.instructorId")}
                value={formData.teacherIds}
                onChange={(e) => setFormData((f) => ({ ...f, teacherIds: e.target.value }))}
                renderValue={(ids) =>
                  ids.map((id) => {
                    const tc = teachers.find((x) => x.id === id);
                    return tc ? `${tc.emri} ${tc.mbiemri}` : id;
                  }).join(", ")
                }
              >
                {teachers.map((tc) => (
                  <MenuItem key={tc.id} value={tc.id}>{tc.emri} {tc.mbiemri}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box className="flex gap-4">
              <FormControl fullWidth>
                <InputLabel>{t("adminSubjects.form.semester")}</InputLabel>
                <Select label={t("adminSubjects.form.semester")} value={formData.semester} onChange={field("semester")}>
                  {availableSemesters.map((s) => (
                    <MenuItem key={s} value={s}>{t("adminSubjects.table.semester")} {s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label={t("adminSubjects.form.credits")} fullWidth type="number" inputProps={{ min: 1, max: 30 }} value={formData.ects} onChange={field("ects")} />
            </Box>
            <Box className="flex gap-4">
              <FormControl fullWidth>
                <InputLabel>{t("adminSubjects.form.status")}</InputLabel>
                <Select label={t("adminSubjects.form.status")} value={formData.statusi} onChange={field("statusi")}>
                  <MenuItem value="DRAFT">{t("adminSubjects.form.statusDraft")}</MenuItem>
                  <MenuItem value="AKTIV">{t("adminSubjects.form.statusActive")}</MenuItem>
                  <MenuItem value="ARKIVUAR">{t("adminSubjects.form.statusArchived")}</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField label={t("adminSubjects.form.enrollmentKey")} fullWidth required value={formData.enrollmentKey} onChange={field("enrollmentKey")} />
          </Box>
        </DialogContent>
        <DialogActions className="px-8! pb-8! pt-4! gap-2">
          <Button onClick={() => setOpenDialog(false)} disabled={saving} className="rounded-2xl! normal-case! font-bold! text-slate-500!">
            {t("adminSubjects.form.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.titulli || !formData.teacherIds?.length || !formData.enrollmentKey?.trim() || saving}
            className="rounded-2xl! px-8! normal-case! font-black! bg-sky-600! hover:bg-sky-700!"
          >
            {saving ? <CircularProgress size={20} className="text-white!" /> : isEdit ? t("adminSubjects.form.update") : t("adminSubjects.form.addSubject")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth TransitionComponent={Zoom}
        PaperProps={{ sx: { borderRadius: "2.5rem", p: 2, backgroundColor: isDark ? "#0f172a" : "white" } }}>
        <DialogTitle className="px-6! pt-6! pb-2!">
          <Typography variant="h5" className="font-black! text-slate-900! dark:text-white!">{t("adminSubjects.confirm.sure")}</Typography>
        </DialogTitle>
        <DialogContent className="px-6! py-4!">
          <Typography className="text-slate-600! dark:text-slate-300!">{t("adminSubjects.confirm.deleteBody")}</Typography>
          <Typography className="font-bold! text-slate-900! dark:text-white! mt-3!">{deleteTarget?.titulli}</Typography>
        </DialogContent>
        <DialogActions className="px-8! pb-8! pt-4! gap-2">
          <Button onClick={() => setOpenDeleteConfirm(false)} className="rounded-2xl! normal-case! font-bold! text-slate-500!">
            {t("adminSubjects.confirm.cancel")}
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} className="rounded-2xl! normal-case! font-black!">
            {t("adminSubjects.confirm.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} TransitionComponent={Zoom}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" variant="filled" sx={{ width: "100%", borderRadius: "1.25rem", fontWeight: "bold" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Footer />
    </Box>
  );
}

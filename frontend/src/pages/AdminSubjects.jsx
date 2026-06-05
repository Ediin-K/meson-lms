import { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Tooltip,
  Zoom,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import BookRounded from "@mui/icons-material/BookRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import AutoStoriesRounded from "@mui/icons-material/AutoStoriesRounded";
import LayersRounded from "@mui/icons-material/LayersRounded";
import Footer from "../components/ui/Footer";
import axiosInstance from "../services/axiosInstance";
import { getDepartmentGroups } from "../services/departmentGroupService";
import { getAllDepartments } from "../services/departmentService";
import { getAllTeachers } from "../services/teacherService";

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
  pershkrimi: "",
  teacherId: "",
  departmentId: "",
  semester: 1,
  enrollmentKey: "",
  ects: 5,
  niveli: "FILLESTAR",
  statusi: "DRAFT",
};

export default function AdminSubjects() {
  const navigate = useNavigate();
  const { t, mode } = useAppPreferences();
  const isDark = mode === "dark";

  const [subjects, setSubjects] = useState([]);
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
  const [groupDialog, setGroupDialog] = useState({ open: false, subject: null });
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [groupForm, setGroupForm] = useState({
    name: "",
    capacity: "",
    teacherIds: "",
    departmentGroupId: "",
  });
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departmentGroupsForSubject, setDepartmentGroupsForSubject] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [subgroupForms, setSubgroupForms] = useState({});
  const [editingSubgroupId, setEditingSubgroupId] = useState(null);
  const [editingSubgroupGroupId, setEditingSubgroupGroupId] = useState(null);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get("/subjects");
      setSubjects(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("adminSubjects.toast.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async (subjectData) => {
    const { data } = await axiosInstance.post("/subjects", subjectData);
    return data;
  };

  const updateSubject = async (id, subjectData) => {
    const { data } = await axiosInstance.put(`/subjects/${id}`, subjectData);
    return data;
  };

  const deleteSubject = async (id) => {
    await axiosInstance.delete(`/subjects/${id}`);
  };

  const fetchSubjectGroups = async (subjectId) => {
    const { data } = await axiosInstance.get(`/subjects/${subjectId}/groups`);
    return data;
  };

  const createGroup = async (subjectId, payload) => {
    const { data } = await axiosInstance.post(`/subjects/${subjectId}/groups`, payload);
    return data;
  };

  const updateGroup = async (groupId, payload) => {
    const { data } = await axiosInstance.put(`/subject-groups/${groupId}`, payload);
    return data;
  };

  const deleteGroup = async (groupId) => {
    await axiosInstance.delete(`/subject-groups/${groupId}`);
  };

  const createSubgroup = async (groupId, payload) => {
    const { data } = await axiosInstance.post(`/subject-groups/${groupId}/subgroups`, payload);
    return data;
  };

  const updateSubgroup = async (subgroupId, payload) => {
    const { data } = await axiosInstance.put(`/subject-subgroups/${subgroupId}`, payload);
    return data;
  };

  const deleteSubgroup = async (subgroupId) => {
    await axiosInstance.delete(`/subject-subgroups/${subgroupId}`);
  };

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
      pershkrimi: subject.pershkrimi,
      teacherId: subject.teacherId,
      departmentId: subject.departmentId,
      semester: subject.semester,
      enrollmentKey: subject.enrollmentKey || "",
      ects: subject.ects ?? 5,
      niveli: subject.niveli,
      statusi: subject.statusi,
    });
    setFormError(null);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setFormError(null);
    try {
      if (isEdit) {
        const updated = await updateSubject(selectedSubject.id, formData);
        setSubjects((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s)),
        );
        setSnackbarMessage(t("adminSubjects.toast.updated"));
      } else {
        const created = await createSubject(formData);
        setSubjects((prev) => [...prev, created]);
        setSnackbarMessage(t("adminSubjects.toast.created"));
      }
      setOpenSnackbar(true);
      setOpenDialog(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (subject) => {
    setDeleteTarget(subject);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteSubject(deleteTarget.id);
      setSubjects((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setSnackbarMessage(`${deleteTarget.titulli} ${t("adminSubjects.toast.deleted")}`);
      setOpenSnackbar(true);
      setDeleteTarget(null);
      setOpenDeleteConfirm(false);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || t("adminSubjects.toast.deleteError"));
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const parseIds = (value) =>
      String(value || "")
          .split(",")
          .map((id) => Number(id.trim()))
          .filter(Boolean);

  const handleOpenGroups = async (subject) => {
    try {
      setGroupDialog({ open: true, subject });
      setGroupForm({ name: "", capacity: "", teacherIds: "", departmentGroupId: "" });
      if (subject.departmentId) {
        setDepartmentGroupsForSubject(await getDepartmentGroups(subject.departmentId));
      } else {
        setDepartmentGroupsForSubject([]);
      }
      setEditingGroupId(null);
      setSubgroupForms({});
      setEditingSubgroupId(null);
      setEditingSubgroupGroupId(null);
      setSubjectGroups(await fetchSubjectGroups(subject.id));
    } catch (err) {
      setError(err.message || t("adminSubjects.toast.groupsError"));
    }
  };

  const handleCreateGroup = async () => {
    if (!groupDialog.subject || !groupForm.name.trim()) return;

    try {
      const payload = {
        name: groupForm.name.trim(),
        capacity: groupForm.capacity ? Number(groupForm.capacity) : null,
        teacherIds: parseIds(groupForm.teacherIds),
        departmentGroupId: groupForm.departmentGroupId ? Number(groupForm.departmentGroupId) : null,
      };

      if (editingGroupId) {
        await updateGroup(editingGroupId, payload);
      } else {
        await createGroup(groupDialog.subject.id, payload);
      }

      setGroupForm({ name: "", capacity: "", teacherIds: "", departmentGroupId: "" });
      setEditingGroupId(null);
      setSubjectGroups(await fetchSubjectGroups(groupDialog.subject.id));
      setSnackbarMessage(editingGroupId ? t("adminSubjects.groups.groupUpdated") : t("adminSubjects.groups.groupCreated"));
      setOpenSnackbar(true);
    } catch (err) {
      setError(err.message || t("adminSubjects.toast.groupCreateError"));
    }
  };

  const handleCreateSubgroup = async (groupId) => {
    const form = subgroupForms[groupId] || {};
    if (!groupDialog.subject || !form.name?.trim()) return;

    try {
      const payload = {
        name: form.name.trim(),
        capacity: form.capacity ? Number(form.capacity) : null,
        assistantIds: parseIds(form.assistantIds),
      };

      if (editingSubgroupId && editingSubgroupGroupId === groupId) {
        await updateSubgroup(editingSubgroupId, payload);
      } else {
        await createSubgroup(groupId, payload);
      }

      setSubgroupForms((prev) => ({ ...prev, [groupId]: {} }));
      setEditingSubgroupId(null);
      setEditingSubgroupGroupId(null);
      setSubjectGroups(await fetchSubjectGroups(groupDialog.subject.id));
      setSnackbarMessage(
          editingSubgroupId && editingSubgroupGroupId === groupId
              ? t("adminSubjects.groups.subgroupUpdated")
              : t("adminSubjects.groups.subgroupCreated"),
      );
      setOpenSnackbar(true);
    } catch (err) {
      setError(err.message || t("adminSubjects.toast.subgroupCreateError"));
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroupId(group.id);
    setGroupForm({
      name: group.name || "",
      capacity: group.capacity || "",
      teacherIds: group.teachers?.map((teacher) => teacher.id).join(", ") || "",
      departmentGroupId: group.departmentGroupId || "",
    });
  };

  const handleDeleteGroup = async (group) => {
    if (!window.confirm(`${t("adminSubjects.groups.tooltipDeleteGroup")} ${group.name}?`)) return;

    try {
      await deleteGroup(group.id);
      setSubjectGroups(await fetchSubjectGroups(groupDialog.subject.id));
      setSnackbarMessage(t("adminSubjects.groups.groupDeleted"));
      setOpenSnackbar(true);
    } catch (err) {
      setError(err.message || t("adminSubjects.toast.groupDeleteError"));
    }
  };

  const handleEditSubgroup = (groupId, subgroup) => {
    setEditingSubgroupId(subgroup.id);
    setEditingSubgroupGroupId(groupId);
    setSubgroupForms((prev) => ({
      ...prev,
      [groupId]: {
        name: subgroup.name || "",
        capacity: subgroup.capacity || "",
        assistantIds: subgroup.assistants?.map((assistant) => assistant.id).join(", ") || "",
      },
    }));
  };

  const handleDeleteSubgroup = async (subgroup) => {
    if (!window.confirm(`${t("adminSubjects.groups.tooltipDeleteGroup")} ${subgroup.name}?`)) return;

    try {
      await deleteSubgroup(subgroup.id);
      setEditingSubgroupId(null);
      setEditingSubgroupGroupId(null);
      setSubjectGroups(await fetchSubjectGroups(groupDialog.subject.id));
      setSnackbarMessage(t("adminSubjects.groups.subgroupDeleted"));
      setOpenSnackbar(true);
    } catch (err) {
      setError(err.message || t("adminSubjects.toast.subgroupDeleteError"));
    }
  };

  const field = (k) => (e) =>
      setFormData((f) => ({ ...f, [k]: e.target.value }));

  const handleDepartmentChange = (e) => {
    setFormData((f) => ({ ...f, departmentId: e.target.value, semester: 1 }));
  };

  const selectedDept = departments.find((d) => String(d.id) === String(formData.departmentId));
  const numSem = parseInt(selectedDept?.numSemesters, 10) || 0;
  const availableSemesters = numSem > 0
      ? Array.from({ length: numSem }, (_, i) => i + 1)
      : [];

  useEffect(() => {
    fetchSubjects();
    getAllDepartments().then(setDepartments).catch(() => {});
    getAllTeachers().then(setTeachers).catch(() => {});
  }, []);

  const filtered = subjects.filter(
      (s) =>
          (s.titulli?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (s.departmentName?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  return (
      <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
        <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 grow">
          {}
          <Box className="mb-8">
            <Button
                startIcon={<ArrowBackRounded />}
                onClick={() => navigate("/admin")}
                className="rounded-2xl! px-6! py-2! normal-case! font-bold! text-slate-600! dark:text-slate-400! hover:bg-slate-200/50! dark:hover:bg-slate-800/50!"
            >
              {t("home.admin.services.backToPanel")}
            </Button>
          </Box>

          {}
          <Box className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <Typography
                  variant="overline"
                  className="font-bold! tracking-[0.3em]! text-sky-600! dark:text-sky-400!"
              >
                {t("adminSubjects.overline")}
              </Typography>
              <Typography
                  variant="h3"
                  component="h1"
                  className="mt-2! font-black! text-slate-900! dark:text-white!"
              >
                {t("adminSubjects.title")}
              </Typography>
              <Typography
                  variant="body1"
                  className="mt-4! max-w-2xl! text-slate-500! dark:text-slate-400! text-lg font-medium!"
              >
                {t("adminSubjects.subtitle")}
              </Typography>
            </div>

            <Box className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <TextField
                  placeholder={t("adminSubjects.searchPlaceholder")}
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-80"
                  InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                          <SearchRounded className="text-slate-400" />
                        </InputAdornment>
                    ),
                    className:
                        "rounded-3xl! bg-white! dark:bg-slate-900! border-none! shadow-sm shadow-slate-200/50 dark:shadow-none",
                  }}
                  sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
              />
              <Button
                  variant="contained"
                  startIcon={<AddRounded />}
                  onClick={handleOpenAdd}
                  className="rounded-3xl! py-4! px-8! normal-case! font-black! bg-sky-600! hover:bg-sky-700! shadow-xl shadow-sky-500/30 transition-all hover:scale-105 active:scale-95"
              >
                {t("adminSubjects.addTitle")}
              </Button>
            </Box>
          </Box>

          {}
          {error && (
              <Alert
                  severity="error"
                  className="mb-6 rounded-2xl!"
                  onClose={() => setError(null)}
              >
                {error}
              </Alert>
          )}

          {}
          <Grid container spacing={3} className="mb-10">
            {[
              {
                label: t("adminSubjects.stats.total"),
                value: subjects.length,
                icon: BookRounded,
                color: "text-sky-600",
                bg: "bg-sky-50 dark:bg-sky-900/20",
              },
              {
                label: t("adminSubjects.stats.departments"),
                value: new Set(subjects.map((s) => s.departmentName)).size,
                icon: AutoStoriesRounded,
                color: "text-emerald-600",
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
              },
              {
                label: t("adminSubjects.stats.teachers"),
                value: new Set(subjects.map((s) => s.teacherId)).size,
                icon: SchoolRounded,
                color: "text-amber-600",
                bg: "bg-amber-50 dark:bg-amber-900/20",
              },
              {
                label: t("adminSubjects.stats.semesters"),
                value: new Set(subjects.map((s) => s.semester)).size,
                icon: LayersRounded,
                color: "text-indigo-600",
                bg: "bg-indigo-50 dark:bg-indigo-900/20",
              },
            ].map((s, i) => (
                <Grid item xs={6} sm={4} md={3} key={i}>
                  <Box className="p-6 rounded-4xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-4">
                    <div
                        className={`h-12 w-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center font-black text-xl`}
                    >
                      <s.icon fontSize="small" />
                    </div>
                    <div>
                      <Typography
                          variant="h5"
                          className="font-black! dark:text-white! leading-none mb-1"
                      >
                        {s.value}
                      </Typography>
                      <Typography
                          variant="caption"
                          className="text-slate-500! font-bold! tracking-widest! uppercase! block!"
                      >
                        {s.label}
                      </Typography>
                    </div>
                  </Box>
                </Grid>
            ))}
          </Grid>

          {}
          <Card
              elevation={0}
              className="rounded-[2.5rem]! border border-slate-200/60 bg-white/80 dark:bg-slate-900/50! backdrop-blur-xl overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-none"
          >
            <Box className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Typography
                  variant="h6"
                  className="font-black! text-slate-800! dark:text-white!"
              >
                {t("adminSubjects.catalogTitle")}
              </Typography>
            </Box>

            {loading ? (
                <Box className="flex justify-center py-32">
                  <CircularProgress className="text-sky-500!" />
                </Box>
            ) : (
                <TableContainer>
                  <Table sx={{ minWidth: 900 }}>
                    <TableHead className="bg-slate-50/50 dark:bg-slate-800/30!">
                      <TableRow>
                        <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6! pl-8!">
                          {t("adminSubjects.table.title")}
                        </TableCell>
                        <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                          {t("adminSubjects.table.department")}
                        </TableCell>
                        <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                          {t("adminSubjects.table.semester")}
                        </TableCell>
                        <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                          {t("adminSubjects.table.credits")}
                        </TableCell>
                        <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                          {t("adminSubjects.table.instructor")}
                        </TableCell>
                        <TableCell className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6!">
                          {t("adminSubjects.table.status")}
                        </TableCell>
                        <TableCell
                            align="right"
                            className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-6! pr-8!"
                        >
                          {t("adminSubjects.table.actions")}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7}>
                              <Box className="flex flex-col items-center justify-center py-24 gap-6">
                                <div className="h-24 w-24 rounded-4xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                                  <MenuBookRounded className="text-5xl! text-slate-200 dark:text-slate-700" />
                                </div>
                                <div className="text-center">
                                  <Typography
                                      variant="h6"
                                      className="font-black! text-slate-800! dark:text-white! mb-1"
                                  >
                                    {t("adminSubjects.noSubjects")}
                                  </Typography>
                                  <Typography
                                      variant="body2"
                                      className="text-slate-400!"
                                  >
                                    {t("adminSubjects.noSubjectsDesc")}
                                  </Typography>
                                </div>
                              </Box>
                            </TableCell>
                          </TableRow>
                      ) : (
                          filtered.map((subject) => (
                              <TableRow
                                  key={subject.id}
                                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                              >
                                <TableCell className="pl-8! py-6!">
                                  <Box className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-inner">
                                      <AutoStoriesRounded fontSize="small" />
                                    </div>
                                    <div>
                                      <Typography
                                          variant="body1"
                                          className="font-black! text-slate-900! dark:text-white!"
                                      >
                                        {subject.titulli}
                                      </Typography>
                                      <Typography
                                          variant="caption"
                                          className="text-slate-500! font-medium! line-clamp-1 max-w-[250px]"
                                      >
                                        {subject.pershkrimi}
                                      </Typography>
                                    </div>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                      label={subject.departmentName}
                                      size="small"
                                      className="font-bold! bg-slate-100! dark:bg-slate-800! text-slate-600! dark:text-slate-400! rounded-lg!"
                                  />
                                </TableCell>
                                <TableCell>
                          <span
                              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${SEMESTER_COLORS[subject.semester] || SEMESTER_COLORS[1]}`}
                          >
                            {subject.semester}
                          </span>
                                </TableCell>
                                <TableCell className="text-slate-700! dark:text-slate-300! font-bold! text-sm!">
                                  {subject.ects ?? 5}
                                </TableCell>
                                <TableCell className="text-slate-600! dark:text-slate-400! font-bold! text-sm!">
                                  {subject.teacherName}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                      label={subject.statusi}
                                      size="small"
                                      className={`!font-bold rounded-lg! ${
                                          subject.statusi === "AKTIV"
                                              ? "bg-emerald-100! text-emerald-700! dark:bg-emerald-900/30! dark:text-emerald-400!"
                                              : "bg-slate-100! text-slate-500! dark:bg-slate-800! dark:text-slate-400!"
                                      }`}
                                  />
                                </TableCell>
                                <TableCell align="right" className="pr-8!">
                                  <Box className="flex justify-end gap-1">
                                    <Tooltip title={t("adminSubjects.tooltips.edit")}>
                                      <IconButton
                                          size="small"
                                          onClick={() => handleOpenEdit(subject)}
                                          className="bg-slate-100! dark:bg-slate-800! text-slate-400! hover:text-sky-600! rounded-xl! transition-all"
                                      >
                                        <EditRounded fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t("adminSubjects.tooltips.groups")}>
                                      <IconButton
                                          size="small"
                                          onClick={() => handleOpenGroups(subject)}
                                          className="bg-slate-100! dark:bg-slate-800! text-slate-400! hover:text-indigo-600! rounded-xl! transition-all"
                                      >
                                        <LayersRounded fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t("adminSubjects.tooltips.delete")}>
                                      <IconButton
                                          size="small"
                                          onClick={() => handleOpenDelete(subject)}
                                          className="bg-slate-100! dark:bg-slate-800! text-slate-400! hover:text-rose-600! rounded-xl! transition-all"
                                      >
                                        <DeleteRounded fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
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

          {}
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
                {isEdit ? t("adminSubjects.editTitle") : t("adminSubjects.addTitle")}
              </Typography>
              <Typography
                  variant="body2"
                  className={
                    isDark ? "text-slate-300! mt-1!" : "text-slate-600! mt-1!"
                  }
              >
                {t("adminSubjects.form.dialogSubtitle")}
              </Typography>
            </DialogTitle>

            <DialogContent
                className={`!px-6 py-4! ${isDark ? "bg-slate-900/20!" : ""}`}
            >
              {}
              {formError && (
                  <Alert
                      severity="error"
                      className="mb-4 rounded-2xl!"
                      onClose={() => setFormError(null)}
                  >
                    {formError}
                  </Alert>
              )}

              <Box className="flex flex-col gap-5 mt-4">
                {}
                <TextField
                    label={t("adminSubjects.form.titleLabel")}
                    fullWidth
                    value={formData.titulli}
                    onChange={field("titulli")}
                    InputProps={{ className: "rounded-2xl!" }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: isDark ? "#f1f5f9" : "#1e293b",
                        "& fieldset": {
                          borderColor: isDark ? "#334155" : "#cbd5e1",
                        },
                        "&:hover fieldset": {
                          borderColor: isDark ? "#475569" : "#94a3b8",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: isDark ? "#cbd5e1" : "#64748b",
                      },
                    }}
                />

                {}
                <TextField
                    label={t("adminSubjects.form.description")}
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.pershkrimi}
                    onChange={field("pershkrimi")}
                    InputProps={{ className: "rounded-2xl!" }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: isDark ? "#f1f5f9" : "#1e293b",
                        "& fieldset": {
                          borderColor: isDark ? "#334155" : "#cbd5e1",
                        },
                        "&:hover fieldset": {
                          borderColor: isDark ? "#475569" : "#94a3b8",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: isDark ? "#cbd5e1" : "#64748b",
                      },
                    }}
                />

                {}
                <Box className="flex gap-4">
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
                      {t("adminSubjects.form.instructorId")}
                    </InputLabel>
                    <Select
                      label={t("adminSubjects.form.instructorId")}
                      value={formData.teacherId}
                      onChange={field("teacherId")}
                      className="rounded-2xl!"
                      sx={{
                        color: isDark ? "#f1f5f9" : "#1e293b",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: isDark ? "#334155" : "#cbd5e1",
                        },
                      }}
                    >
                      {teachers.map((tc) => (
                        <MenuItem key={tc.id} value={tc.id}>
                          {tc.emri} {tc.mbiemri} — ID: {tc.id}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
                      {t("adminSubjects.form.departmentId")}
                    </InputLabel>
                    <Select
                      label={t("adminSubjects.form.departmentId")}
                      value={formData.departmentId}
                      onChange={handleDepartmentChange}
                      className="rounded-2xl!"
                      sx={{
                        color: isDark ? "#f1f5f9" : "#1e293b",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: isDark ? "#334155" : "#cbd5e1",
                        },
                      }}
                    >
                      {departments.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.emertimi}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {}
                <Box className="flex gap-4">
                  <FormControl fullWidth disabled={availableSemesters.length === 0}>
                    <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
                      {availableSemesters.length > 0 ? t("adminSubjects.form.semester") : t("adminSubjects.form.selectDeptFirst")}
                    </InputLabel>
                    <Select variant="outlined"
                            value={availableSemesters.includes(formData.semester) ? formData.semester : ""}
                            label={availableSemesters.length > 0 ? t("adminSubjects.form.semester") : t("adminSubjects.form.selectDeptFirst")}
                            onChange={field("semester")}
                            sx={{
                              borderRadius: "1rem",
                              color: isDark ? "#f1f5f9" : "#1e293b",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: isDark ? "#334155" : "#cbd5e1",
                              },
                              "& .MuiSvgIcon-root": {
                                color: isDark ? "#cbd5e1" : "#64748b",
                              },
                            }}
                    >
                      {availableSemesters.map((s) => (
                          <MenuItem key={s} value={s}>
                            {t("adminSubjects.table.semester")} {s}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                      label={t("adminSubjects.form.credits")}
                      fullWidth
                      type="number"
                      inputProps={{ min: 1, max: 30 }}
                      value={formData.ects}
                      onChange={field("ects")}
                      InputProps={{ className: "rounded-2xl!" }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: isDark ? "#f1f5f9" : "#1e293b",
                          "& fieldset": {
                            borderColor: isDark ? "#334155" : "#cbd5e1",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: isDark ? "#cbd5e1" : "#64748b",
                        },
                      }}
                  />
                </Box>

                {}
                <Box className="flex gap-4">
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
                      {t("adminSubjects.form.level")}
                    </InputLabel>
                    <Select variant="outlined"
                            value={formData.niveli}
                            label={t("adminSubjects.form.level")}
                            onChange={field("niveli")}
                            sx={{
                              borderRadius: "1rem",
                              color: isDark ? "#f1f5f9" : "#1e293b",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: isDark ? "#334155" : "#cbd5e1",
                              },
                              "& .MuiSvgIcon-root": {
                                color: isDark ? "#cbd5e1" : "#64748b",
                              },
                            }}
                    >
                      <MenuItem value="FILLESTAR">{t("adminSubjects.form.levelBeginner")}</MenuItem>
                      <MenuItem value="MESEM">{t("adminSubjects.form.levelIntermediate")}</MenuItem>
                      <MenuItem value="AVANCUAR">{t("adminSubjects.form.levelAdvanced")}</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>
                      {t("adminSubjects.form.status")}
                    </InputLabel>
                    <Select variant="outlined"
                            value={formData.statusi}
                            label={t("adminSubjects.form.status")}
                            onChange={field("statusi")}
                            sx={{
                              borderRadius: "1rem",
                              color: isDark ? "#f1f5f9" : "#1e293b",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: isDark ? "#334155" : "#cbd5e1",
                              },
                              "& .MuiSvgIcon-root": {
                                color: isDark ? "#cbd5e1" : "#64748b",
                              },
                            }}
                    >
                      <MenuItem value="DRAFT">{t("adminSubjects.form.statusDraft")}</MenuItem>
                      <MenuItem value="AKTIV">{t("adminSubjects.form.statusActive")}</MenuItem>
                      <MenuItem value="ARKIVUAR">{t("adminSubjects.form.statusArchived")}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {}
                <TextField
                    label={t("adminSubjects.form.enrollmentKey")}
                    fullWidth
                    value={formData.enrollmentKey}
                    onChange={field("enrollmentKey")}
                    InputProps={{ className: "rounded-2xl!" }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: isDark ? "#f1f5f9" : "#1e293b",
                        "& fieldset": {
                          borderColor: isDark ? "#334155" : "#cbd5e1",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: isDark ? "#cbd5e1" : "#64748b",
                      },
                    }}
                />
              </Box>
            </DialogContent>

            <DialogActions className="px-8! pb-8! pt-4! gap-2">
              <Button
                  onClick={() => setOpenDialog(false)}
                  disabled={saving}
                  className="rounded-2xl! px-6! py-3! normal-case! font-bold! text-slate-500! hover:bg-slate-100! dark:hover:bg-slate-800!"
              >
                {t("adminSubjects.form.cancel")}
              </Button>
              <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={
                      !formData.titulli ||
                      !formData.teacherId ||
                      !formData.departmentId ||
                      saving
                  }
                  className="rounded-2xl! px-10! py-3! normal-case! font-black! bg-sky-600! hover:bg-sky-700! shadow-lg shadow-sky-500/20"
              >
                {saving ? (
                    <CircularProgress size={20} className="text-white!" />
                ) : isEdit ? (
                    t("adminSubjects.form.update")
                ) : (
                    t("adminSubjects.form.addSubject")
                )}
              </Button>
            </DialogActions>
          </Dialog>

          {}
          <Dialog
              open={groupDialog.open}
              onClose={() => setGroupDialog({ open: false, subject: null })}
              maxWidth="md"
              fullWidth
              TransitionComponent={Zoom}
              PaperProps={{
                sx: {
                  borderRadius: "2rem",
                  p: 2,
                  backgroundColor: isDark ? "#0f172a" : "white",
                },
              }}
          >
            <DialogTitle className="px-6! pt-6! pb-2!">
              <Typography variant="h5" className="font-black! text-slate-900! dark:text-white!">
                {t("adminSubjects.groups.dialogTitle")}
              </Typography>
              <Typography variant="body2" className="text-slate-500! dark:text-slate-400!">
                {groupDialog.subject?.titulli}
              </Typography>
            </DialogTitle>
            <DialogContent className="px-6! py-4!">
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <TextField
                    label={t("adminSubjects.groups.groupNameLabel")}
                    placeholder="G1"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                <FormControl fullWidth>
                  <InputLabel>{t("adminSubjects.groups.deptGroupLabel")}</InputLabel>
                  <Select
                      value={groupForm.departmentGroupId}
                      label={t("adminSubjects.groups.deptGroupLabel")}
                      onChange={(e) => setGroupForm((prev) => ({ ...prev, departmentGroupId: e.target.value }))}
                  >
                    <MenuItem value="">{t("adminSubjects.groups.noLink")}</MenuItem>
                    {departmentGroupsForSubject.map((dg) => (
                        <MenuItem key={dg.id} value={dg.id}>
                          {dg.name} ({dg.currentStudents}/{dg.maxCapacity})
                        </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                    label={t("adminSubjects.groups.capacityLabel")}
                    type="number"
                    value={groupForm.capacity}
                    onChange={(e) => setGroupForm((prev) => ({ ...prev, capacity: e.target.value }))}
                />
                <TextField
                    label="Professor IDs"
                    placeholder="2, 5"
                    value={groupForm.teacherIds}
                    onChange={(e) => setGroupForm((prev) => ({ ...prev, teacherIds: e.target.value }))}
                />
              </Box>
              <Button
                  variant="contained"
                  startIcon={<AddRounded />}
                  onClick={handleCreateGroup}
                  disabled={!groupForm.name.trim()}
                  className="rounded-xl! normal-case! font-bold! bg-indigo-600! mb-6!"
              >
                {editingGroupId ? t("adminSubjects.groups.saveGroup") : t("adminSubjects.groups.addGroup")}
              </Button>
              {editingGroupId && (
                  <Button
                      variant="text"
                      onClick={() => {
                        setEditingGroupId(null);
                        setGroupForm({ name: "", capacity: "", teacherIds: "", departmentGroupId: "" });
                      }}
                      className="rounded-xl! normal-case! font-bold! text-slate-500! dark:text-slate-300! mb-6! ml-2!"
                  >
                    {t("adminSubjects.groups.cancelEdit")}
                  </Button>
              )}

              <Box className="flex flex-col gap-4">
                {subjectGroups.map((group) => {
                  const form = subgroupForms[group.id] || {};
                  return (
                      <Box key={group.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                        <Box className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                          <div>
                            <Typography className="font-black! text-slate-900! dark:text-white!">
                              {t("adminSubjects.groups.groupPrefix")}{group.name}
                            </Typography>
                            <Typography variant="caption" className="text-slate-500!">
                              {t("adminSubjects.groups.professorPrefix")}{group.teachers?.map((tc) => tc.name).join(", ") || "-"}
                            </Typography>
                          </div>
                          <Box className="flex gap-1">
                            <Tooltip title={t("adminSubjects.groups.tooltipEditGroup")}>
                              <IconButton
                                  size="small"
                                  onClick={() => handleEditGroup(group)}
                                  className="bg-indigo-50! text-indigo-700! hover:bg-indigo-100! dark:bg-indigo-900/30! dark:text-indigo-200! dark:hover:bg-indigo-900/50!"
                              >
                                <EditRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t("adminSubjects.groups.tooltipDeleteGroup")}>
                              <IconButton
                                  size="small"
                                  onClick={() => handleDeleteGroup(group)}
                                  className="bg-rose-50! text-rose-700! hover:bg-rose-100! dark:bg-rose-900/30! dark:text-rose-200! dark:hover:bg-rose-900/50!"
                              >
                                <DeleteRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        <Box className="flex flex-wrap gap-2 mb-4">
                          {group.subgroups?.map((subgroup) => (
                              <Box
                                  key={subgroup.id}
                                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800/70"
                              >
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                            {subgroup.name}
                            {subgroup.assistants?.length
                                ? ` - ${subgroup.assistants.map((a) => a.name).join(", ")}`
                                : ""}
                          </span>
                                <IconButton
                                    size="small"
                                    onClick={() => handleEditSubgroup(group.id, subgroup)}
                                    className="text-indigo-600! dark:text-indigo-200!"
                                >
                                  <EditRounded fontSize="inherit" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDeleteSubgroup(subgroup)}
                                    className="text-rose-600! dark:text-rose-200!"
                                >
                                  <DeleteRounded fontSize="inherit" />
                                </IconButton>
                              </Box>
                          ))}
                        </Box>

                        <Box className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <TextField
                              size="small"
                              label={t("adminSubjects.groups.subgroupLabel")}
                              placeholder="G1A"
                              value={form.name || ""}
                              onChange={(e) =>
                                  setSubgroupForms((prev) => ({
                                    ...prev,
                                    [group.id]: { ...form, name: e.target.value },
                                  }))
                              }
                          />
                          <TextField
                              size="small"
                              label={t("adminSubjects.groups.capacityLabel")}
                              type="number"
                              value={form.capacity || ""}
                              onChange={(e) =>
                                  setSubgroupForms((prev) => ({
                                    ...prev,
                                    [group.id]: { ...form, capacity: e.target.value },
                                  }))
                              }
                          />
                          <TextField
                              size="small"
                              label="Assistant IDs"
                              placeholder="7, 9"
                              value={form.assistantIds || ""}
                              onChange={(e) =>
                                  setSubgroupForms((prev) => ({
                                    ...prev,
                                    [group.id]: { ...form, assistantIds: e.target.value },
                                  }))
                              }
                          />
                        </Box>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleCreateSubgroup(group.id)}
                            disabled={!form.name?.trim()}
                            className="rounded-xl! normal-case! font-bold! mt-3! border-indigo-300! text-indigo-700! hover:bg-indigo-50! dark:border-indigo-500! dark:text-indigo-200! dark:hover:bg-indigo-900/30!"
                        >
                          {editingSubgroupGroupId === group.id ? t("adminSubjects.groups.saveSubgroup") : t("adminSubjects.groups.addSubgroup")}
                        </Button>
                        {editingSubgroupGroupId === group.id && (
                            <Button
                                size="small"
                                variant="text"
                                onClick={() => {
                                  setEditingSubgroupId(null);
                                  setEditingSubgroupGroupId(null);
                                  setSubgroupForms((prev) => ({ ...prev, [group.id]: {} }));
                                }}
                                className="rounded-xl! normal-case! font-bold! mt-3! ml-2! text-slate-500! dark:text-slate-300!"
                            >
                              {t("adminSubjects.form.cancel")}
                            </Button>
                        )}
                      </Box>
                  );
                })}

                {subjectGroups.length === 0 && (
                    <Typography className="text-slate-500! text-center! py-8!">
                      {t("adminSubjects.groups.noGroups")}
                    </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions className="px-8! pb-8!">
              <Button
                  onClick={() => setGroupDialog({ open: false, subject: null })}
                  className="rounded-xl! normal-case! font-bold!"
              >
                {t("adminSubjects.groups.close")}
              </Button>
            </DialogActions>
          </Dialog>

          {}
          <Dialog
              open={openDeleteConfirm}
              onClose={() => {
                setOpenDeleteConfirm(false);
                setDeleteTarget(null);
              }}
              maxWidth="xs"
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
                  component="p"
                  className={
                    isDark
                        ? "font-black! text-white!"
                        : "font-black! text-slate-900!"
                  }
              >
                {t("adminSubjects.confirm.sure")}
              </Typography>
            </DialogTitle>
            <DialogContent className="px-6! py-4!">
              <Typography
                  variant="body2"
                  className={isDark ? "text-slate-300!" : "text-slate-600!"}
              >
                {t("adminSubjects.confirm.deleteBody")}
              </Typography>
              <Typography
                  variant="body1"
                  className={
                    isDark
                        ? "font-bold! text-white! mt-3!"
                        : "font-bold! text-slate-900! mt-3!"
                  }
              >
                {deleteTarget ? deleteTarget.titulli : ""}
              </Typography>
              <Typography
                  variant="caption"
                  className={isDark ? "text-slate-400!" : "text-slate-500!"}
              >
                {deleteTarget ? deleteTarget.pershkrimi : ""}
              </Typography>
            </DialogContent>
            <DialogActions className="px-8! pb-8! pt-4! gap-2">
              <Button
                  onClick={() => {
                    setOpenDeleteConfirm(false);
                    setDeleteTarget(null);
                  }}
                  className="rounded-2xl! px-6! py-3! normal-case! font-bold! text-slate-500! hover:bg-slate-100! dark:hover:bg-slate-800!"
              >
                {t("adminSubjects.confirm.cancel")}
              </Button>
              <Button
                  variant="contained"
                  color="error"
                  onClick={handleConfirmDelete}
                  className="rounded-2xl! px-10! py-3! normal-case! font-black!"
              >
                {t("adminSubjects.confirm.delete")}
              </Button>
            </DialogActions>
          </Dialog>

          {}
          <Snackbar
              open={openSnackbar}
              autoHideDuration={4000}
              onClose={() => setOpenSnackbar(false)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              TransitionComponent={Zoom}
          >
            <Alert
                onClose={() => setOpenSnackbar(false)}
                severity="success"
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
      </Box>
  );
}

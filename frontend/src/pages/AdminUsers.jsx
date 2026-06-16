import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../context/appPreferencesContext";
import {
  Typography, Container, Box, Card, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Avatar, CircularProgress,
  Snackbar, Alert, Tooltip, Zoom, Grid, TablePagination, Divider,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
import ScienceRounded from "@mui/icons-material/ScienceRounded";
import PersonAddRounded from "@mui/icons-material/PersonAddRounded";
import VerifiedUserRounded from "@mui/icons-material/VerifiedUserRounded";
import FilterListRounded from "@mui/icons-material/FilterListRounded";
import Footer from "../components/ui/Footer";
import axiosInstance from "../services/axiosInstance";
import { getDepartmentGroups } from "../services/departmentGroupService";
import {
  assignStudentToGroup,
  getStudentGroupStatus,
  removeStudentFromGroup,
} from "../services/studentGroupService";

/* ─── Role meta ─────────────────────────────────────────────────── */
const ROLE_STYLE = {
  admin:      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  teacher:    "bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300",
  student:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  assistant:  "bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300",
  parent:     "bg-rose-100   text-rose-700   dark:bg-rose-900/40   dark:text-rose-300",
};
const AVATAR_GRADIENT = {
  admin:     "from-violet-500 to-purple-600",
  teacher:   "from-sky-500 to-blue-600",
  student:   "from-emerald-500 to-teal-600",
  assistant: "from-amber-500 to-orange-600",
  parent:    "from-rose-500 to-pink-600",
};

/* Roles that store a department + semester profile */
const PROFILE_ROLES = ["student", "teacher", "assistant"];

const EMPTY_FORM = {
  emri: "", mbiemri: "", email: "", password: "",
  role: "student", statusi: "active",
  departmentId: "", currentSemester: 1,
};

/* ─── Role-create cards config ───────────────────────────────────── */
const ROLE_CARDS = [
  {
    role: "student",
    icon: SchoolRounded,
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400",
    labelKey: "adminUsers.cards.student",
    descKey:  "adminUsers.cards.studentDesc",
  },
  {
    role: "teacher",
    icon: PeopleRounded,
    color: "text-sky-700 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-900/20",
    border: "border-sky-200 dark:border-sky-800/60 hover:border-sky-400",
    labelKey: "adminUsers.cards.teacher",
    descKey:  "adminUsers.cards.teacherDesc",
  },
  {
    role: "assistant",
    icon: ScienceRounded,
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800/60 hover:border-amber-400",
    labelKey: "adminUsers.cards.assistant",
    descKey:  "adminUsers.cards.assistantDesc",
  },
  {
    role: "admin",
    icon: AdminPanelSettingsRounded,
    color: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200 dark:border-violet-800/60 hover:border-violet-400",
    labelKey: "adminUsers.cards.admin",
    descKey:  "adminUsers.cards.adminDesc",
  },
];

export default function AdminUsers() {
  const navigate = useNavigate();
  const { t, mode } = useAppPreferences();
  const isDark = mode === "dark";

  /* ─── Table state ─── */
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [roleCounts, setRoleCounts] = useState({ teachers: 0, students: 0, active: 0 });

  /* ─── Dialog state ─── */
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  /* ─── Student group state (only used in edit mode for students) ─── */
  const [studentGroups, setStudentGroups] = useState([]);
  const [groupAssignId, setGroupAssignId] = useState("");
  const [approvedGroupLabel, setApprovedGroupLabel] = useState("");
  const [groupAssignLoading, setGroupAssignLoading] = useState(false);

  /* ─── Delete state ─── */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  /* ─── Toast ─── */
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const showToast = (msg, sev = "success") => {
    setSnackbarMessage(msg); setSnackbarSeverity(sev); setOpenSnackbar(true);
  };

  /* ─── Debounce search ─── */
  useEffect(() => {
    const h = setTimeout(() => { setDebouncedSearch(searchTerm.trim()); setPage(0); }, 400);
    return () => clearTimeout(h);
  }, [searchTerm]);

  /* ─── Load users ─── */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: rowsPerPage, search: debouncedSearch, role: roleFilter === "all" ? "" : roleFilter };
      const [pageRes, teachersRes, studentsRes, activeRes] = await Promise.all([
        axiosInstance.get("/users/paged", { params }),
        axiosInstance.get("/users/paged", { params: { size: 1, role: "teacher" } }),
        axiosInstance.get("/users/paged", { params: { size: 1, role: "student" } }),
        axiosInstance.get("/users/paged", { params: { size: 1, status: "active" } }),
      ]);
      setUsers(pageRes.data.content);
      setTotalCount(pageRes.data.totalElements);
      setRoleCounts({ teachers: teachersRes.data.totalElements, students: studentsRes.data.totalElements, active: activeRes.data.totalElements });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, roleFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  /* ─── Load departments ─── */
  useEffect(() => {
    axiosInstance.get("/departments").then((r) => setDepartments(r.data)).catch(() => setDepartments([]));
  }, []);

  /* ─── Student group helpers ─── */
  const loadStudentGroupContext = async (user) => {
    if (user.role !== "student" || !user.departmentId) {
      setStudentGroups([]); setApprovedGroupLabel(""); setGroupAssignId(""); return;
    }
    try {
      const [groups, status] = await Promise.all([
        getDepartmentGroups(user.departmentId, user.currentSemester || 1),
        getStudentGroupStatus(user.id),
      ]);
      setStudentGroups(groups);
      if (status?.approvedGroup) {
        setApprovedGroupLabel(`${status.approvedGroup.name} (Sem. ${status.approvedGroup.semester})`);
        setGroupAssignId("");
      } else {
        setApprovedGroupLabel("");
      }
    } catch { setStudentGroups([]); setApprovedGroupLabel(""); }
  };

  const handleAssignGroup = async () => {
    if (!selectedUser?.id || !groupAssignId) return;
    setGroupAssignLoading(true);
    try {
      await assignStudentToGroup(selectedUser.id, Number(groupAssignId));
      await loadStudentGroupContext({ ...selectedUser, departmentId: formData.departmentId, currentSemester: formData.currentSemester });
      setGroupAssignId("");
      showToast(t("adminUsers.toast.assignSuccess"));
    } catch (err) { showToast(err?.response?.data?.message || t("adminUsers.toast.assignError"), "error"); }
    finally { setGroupAssignLoading(false); }
  };

  const handleRemoveGroup = async () => {
    if (!selectedUser?.id) return;
    if (!window.confirm(t("adminUsers.toast.removeConfirm"))) return;
    setGroupAssignLoading(true);
    try {
      await removeStudentFromGroup(selectedUser.id);
      await loadStudentGroupContext(selectedUser);
      showToast(t("adminUsers.toast.removeSuccess"));
    } catch (err) { showToast(err?.response?.data?.message || t("adminUsers.toast.removeError"), "error"); }
    finally { setGroupAssignLoading(false); }
  };

  /* ─── Open dialogs ─── */
  const handleOpenAddRole = (role) => {
    setIsEdit(false);
    setSelectedUser(null);
    setFormData({ ...EMPTY_FORM, role, currentSemester: 1 });
    setStudentGroups([]); setApprovedGroupLabel(""); setGroupAssignId("");
    setOpenDialog(true);
  };

  const handleOpenEdit = (user) => {
    setIsEdit(true);
    setSelectedUser(user);
    setFormData({
      emri: user.emri || "", mbiemri: user.mbiemri || "", email: user.email || "",
      phoneNumber: user.phoneNumber || "", role: user.role || "student",
      statusi: user.statusi || "active", password: "",
      departmentId: user.departmentId || "", currentSemester: user.currentSemester || 1,
    });
    setGroupAssignId("");
    loadStudentGroupContext(user);
    setOpenDialog(true);
  };

  /* ─── Submit ─── */
  const field = (k) => (e) => setFormData((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    const sendsDept = PROFILE_ROLES.includes(formData.role);
    const base = {
      emri: formData.emri, mbiemri: formData.mbiemri, email: formData.email,
      role: formData.role, statusi: formData.statusi,
      departmentId: sendsDept && formData.departmentId ? Number(formData.departmentId) : null,
      currentSemester: sendsDept ? Number(formData.currentSemester || 1) : null,
    };
    const body = isEdit
      ? { ...base, phoneNumber: formData.phoneNumber || "", ...(formData.password ? { password: formData.password } : {}) }
      : { ...base, password: formData.password };
    try {
      if (isEdit) await axiosInstance.put(`/users/${selectedUser.id}`, body);
      else        await axiosInstance.post("/users", body);
      await loadUsers();
      showToast(isEdit ? t("adminUsers.toast.updated") : t("adminUsers.toast.created"));
      setOpenDialog(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || t("adminUsers.toast.saveError");
      showToast(typeof msg === "string" ? msg : t("adminUsers.toast.saveError"), "error");
    }
  };

  /* ─── Delete ─── */
  const handleOpenDelete = (user) => { setDeleteTarget(user); setOpenDeleteConfirm(true); };
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axiosInstance.delete(`/users/${deleteTarget.id}`);
      await loadUsers();
      showToast(`${deleteTarget.emri} ${deleteTarget.mbiemri} ${t("adminUsers.toast.deleted")}`);
      setDeleteTarget(null); setOpenDeleteConfirm(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || t("adminUsers.toast.deleteError");
      showToast(typeof msg === "string" ? msg : t("adminUsers.toast.deleteError"), "error");
    }
  };

  /* ─── Shared input sx ─── */
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: isDark ? "#f1f5f9" : "#1e293b",
      "& fieldset": { borderColor: isDark ? "#334155" : "#cbd5e1" },
      "&:hover fieldset": { borderColor: isDark ? "#475569" : "#94a3b8" },
    },
    "& .MuiInputLabel-root": { color: isDark ? "#cbd5e1" : "#64748b" },
  };
  const selectSx = {
    borderRadius: "1rem",
    color: isDark ? "#f1f5f9" : "#1e293b",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#334155" : "#cbd5e1" },
    "& .MuiSvgIcon-root": { color: isDark ? "#cbd5e1" : "#64748b" },
  };

  const showsDept = PROFILE_ROLES.includes(formData.role);

  /* ─── Role card dialog title / subtitle ─── */
  const dialogTitle = isEdit ? t("adminUsers.form.editTitle") : t(`adminUsers.cards.${formData.role}`);
  const dialogSub   = isEdit ? t("adminUsers.form.editSubtitle") : t(`adminUsers.cards.${formData.role}Desc`);

  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 grow">

        {/* Header */}
        <Box className="flex items-center justify-between mb-8">
          <Button startIcon={<ArrowBackRounded />} onClick={() => navigate("/admin")}
            className="rounded-2xl! px-6! py-2! normal-case! font-bold! text-slate-600! dark:text-slate-400! hover:bg-slate-200/50! dark:hover:bg-slate-800/50!">
            {t("home.admin.services.backToPanel")}
          </Button>
          <Tooltip title={t("adminUsers.advancedFilters")}>
            <IconButton className="bg-white! dark:bg-slate-900! border border-slate-200 dark:border-slate-800 rounded-xl!">
              <FilterListRounded className="text-slate-500" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Title */}
        <Box className="mb-10">
          <Typography variant="overline" className="font-bold! tracking-[0.3em]! text-indigo-600! dark:text-indigo-400!">
            {t("adminUsers.overline")}
          </Typography>
          <Typography variant="h3" component="h1" className="mt-2! font-black! text-slate-900! dark:text-white!">
            {t("adminUsers.title")}
          </Typography>
          <Typography variant="body1" className="mt-3! text-slate-500! dark:text-slate-400!">
            {t("adminUsers.subtitle")}
          </Typography>
        </Box>

        {/* ── Role create cards ── */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {ROLE_CARDS.map(({ role, icon: Icon, color, bg, border, labelKey, descKey }) => (
            <button
              key={role}
              type="button"
              onClick={() => handleOpenAddRole(role)}
              className={`group flex flex-col items-start gap-3 rounded-2xl border-2 bg-white p-5 text-left transition-all hover:shadow-md dark:bg-slate-900 ${border}`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${color}`}>
                <Icon fontSize="small" />
              </div>
              <div>
                <Typography variant="body2" className={`!font-black ${color}`}>
                  {t(labelKey)}
                </Typography>
                <Typography variant="caption" className="!text-slate-500 dark:!text-slate-400">
                  {t(descKey)}
                </Typography>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${color}`}>
                <PersonAddRounded style={{ fontSize: 14 }} />
                {t("adminUsers.cards.create")}
              </div>
            </button>
          ))}
        </div>

        {/* ── Stats row ── */}
        <Grid container spacing={3} className="mb-8">
          {[
            { label: t("adminUsers.stats.total"),    value: totalCount,          color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
            { label: t("adminUsers.stats.active"),   value: roleCounts.active,   color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: t("adminUsers.stats.teachers"), value: roleCounts.teachers, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-900/20" },
            { label: t("adminUsers.stats.students"), value: roleCounts.students, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
          ].map((s, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Box className="flex items-center gap-4 rounded-3xl border border-slate-200/50 bg-white p-5 shadow-sm dark:border-slate-800/50 dark:bg-slate-900">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-xl ${s.bg} ${s.color}`}>
                  {s.value}
                </div>
                <Typography variant="caption" className="!font-bold !uppercase !tracking-widest !text-slate-500">
                  {s.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* ── User table ── */}
        <Card elevation={0} className="rounded-[2.5rem]! border border-slate-200/60 bg-white/80 dark:bg-slate-900/50! overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-none">
          <Box className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 p-6 dark:border-slate-800">
            <Typography variant="h6" className="font-black! text-slate-800! dark:text-white!">
              {t("adminUsers.listTitle")}
            </Typography>
            <Box className="flex flex-wrap items-center gap-2">
              <TextField
                placeholder={t("adminUsers.searchPlaceholder")}
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchRounded className="text-slate-400" fontSize="small" /></InputAdornment>,
                  className: "rounded-2xl! bg-slate-50! dark:bg-slate-800! border-none!",
                }}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" }, width: 200 }}
              />
              {["all", "student", "teacher", "assistant", "admin", "parent"].map((r) => (
                <Button key={r} size="small"
                  onClick={() => { setRoleFilter(r); setPage(0); }}
                  className={`!rounded-full !px-4 !py-1 !normal-case !text-xs !font-bold ${roleFilter === r ? "!bg-slate-900 !text-white dark:!bg-white dark:!text-slate-900" : "!text-slate-500 hover:!bg-slate-100 dark:hover:!bg-slate-800"}`}>
                  {r === "all" ? t("adminUsers.filterAll") : r.charAt(0).toUpperCase() + r.slice(1)}
                </Button>
              ))}
            </Box>
          </Box>

          {loading ? (
            <Box className="flex justify-center py-32"><CircularProgress className="text-indigo-500!" /></Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead className="bg-slate-50/50 dark:bg-slate-800/30!">
                  <TableRow>
                    {[t("adminUsers.table.name"), t("adminUsers.table.role"), t("adminUsers.table.status"), t("adminUsers.table.joined")].map((h, i) => (
                      <TableCell key={i} className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-5!" sx={{ paddingLeft: i === 0 ? "2rem" : undefined }}>
                        {h}
                      </TableCell>
                    ))}
                    <TableCell align="right" className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-5! pr-8!">
                      {t("adminUsers.table.actions")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box className="flex flex-col items-center justify-center gap-4 py-24">
                          <PeopleRounded className="text-6xl! text-slate-200 dark:text-slate-700" />
                          <Typography variant="h6" className="font-black! text-slate-800! dark:text-white!">{t("adminUsers.empty.title")}</Typography>
                          <Typography variant="body2" className="text-slate-400!">{t("adminUsers.empty.description")}</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : users.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <TableCell className="pl-8! py-5!">
                        <Box className="flex items-center gap-4">
                          <Avatar className={`!w-11 !h-11 !rounded-2xl !text-sm !font-black bg-gradient-to-br! ${AVATAR_GRADIENT[user.role] || "from-slate-400 to-slate-500"} shadow-md`}>
                            {user.emri?.charAt(0)}{user.mbiemri?.charAt(0)}
                          </Avatar>
                          <div>
                            <Typography variant="body2" className="font-black! text-slate-900! dark:text-white! flex! items-center gap-1">
                              {user.emri} {user.mbiemri}
                              {user.role === "admin" && <VerifiedUserRounded className="!text-sky-500 !text-sm" />}
                            </Typography>
                            <Typography variant="caption" className="text-slate-500! font-medium!">{user.email}</Typography>
                          </div>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <span className={`rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest ${ROLE_STYLE[user.role] || "bg-slate-100 text-slate-600"}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Box className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${user.statusi === "active" ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-700"}`} />
                          <Typography variant="caption" className={`!font-black !uppercase !tracking-widest ${user.statusi === "active" ? "text-emerald-600" : "text-slate-400"}`}>
                            {user.statusi === "active" ? t("adminUsers.status.active") : t("adminUsers.status.inactive")}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell className="text-slate-500! font-bold! text-xs!">
                        {user.joined ? new Date(user.joined).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell align="right" className="pr-8!">
                        <Box className="flex justify-end gap-1">
                          <IconButton size="small" onClick={() => handleOpenEdit(user)}
                            className="bg-slate-100! dark:bg-slate-800! text-slate-400! hover:text-indigo-600! rounded-xl! transition-all">
                            <EditRounded fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleOpenDelete(user)}
                            className="bg-slate-100! dark:bg-slate-800! text-slate-400! hover:text-rose-600! rounded-xl! transition-all">
                            <DeleteRounded fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {!loading && (
            <TablePagination
              component="div" count={totalCount} page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          )}
        </Card>

        {/* ══════════ Create / Edit dialog ══════════ */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth
          TransitionComponent={Zoom}
          PaperProps={{ sx: { borderRadius: "2.5rem", p: 2, backgroundColor: isDark ? "#0f172a" : "white", border: isDark ? "1px solid #1e293b" : "1px solid rgba(148,163,184,0.15)", boxShadow: isDark ? "0 30px 60px rgba(15,23,42,0.65)" : "0 30px 60px rgba(148,163,184,0.15)" } }}>
          <DialogTitle className="px-6! pt-6! pb-2!">
            <Typography variant="h5" component="p" className={isDark ? "font-black! text-white!" : "font-black! text-slate-900!"}>
              {dialogTitle}
            </Typography>
            <Typography variant="body2" className={isDark ? "text-slate-300! mt-1!" : "text-slate-500! mt-1!"}>
              {dialogSub}
            </Typography>
          </DialogTitle>

          <DialogContent className={`!px-6 !py-4 ${isDark ? "bg-slate-900/20!" : ""}`}>
            <Box className="mt-4 flex flex-col gap-5">

              {/* Name row */}
              <Box className="flex gap-4">
                <TextField name="u-fn" autoComplete="off" label={t("adminUsers.form.firstName")} fullWidth
                  value={formData.emri} onChange={field("emri")} InputProps={{ className: "rounded-2xl!" }} sx={inputSx} />
                <TextField name="u-ln" autoComplete="off" label={t("adminUsers.form.lastName")} fullWidth
                  value={formData.mbiemri} onChange={field("mbiemri")} InputProps={{ className: "rounded-2xl!" }} sx={inputSx} />
              </Box>

              {/* Email */}
              <TextField name="u-em" autoComplete="off" label={t("adminUsers.form.email")} type="email" fullWidth
                value={formData.email} onChange={field("email")} InputProps={{ className: "rounded-2xl!" }} sx={inputSx} />

              {/* Password (required for create, optional for edit) */}
              <TextField name="u-pw" autoComplete="new-password"
                label={isEdit ? t("adminUsers.form.passwordOptional") : t("adminUsers.form.password")}
                type="password" fullWidth value={formData.password || ""} onChange={field("password")}
                InputProps={{ className: "rounded-2xl!" }} sx={inputSx}
                helperText={isEdit ? t("adminUsers.form.passwordHint") : undefined} />

              {/* Status (edit only) */}
              {isEdit && (
                <FormControl fullWidth>
                  <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>{t("adminUsers.table.status")}</InputLabel>
                  <Select value={formData.statusi} label={t("adminUsers.table.status")} onChange={field("statusi")} sx={selectSx}>
                    <MenuItem value="active">{t("adminUsers.form.statusActive")}</MenuItem>
                    <MenuItem value="inactive">{t("adminUsers.form.statusInactive")}</MenuItem>
                  </Select>
                </FormControl>
              )}

              {/* Department + Semester — shown for student / teacher / assistant */}
              {showsDept && (
                <>
                  <Divider className="!my-1">
                    <Typography variant="caption" className="!font-semibold !uppercase !tracking-wider !text-slate-400">
                      {t("adminUsers.form.academicInfo")}
                    </Typography>
                  </Divider>
                  <Box className="flex gap-4">
                    <FormControl fullWidth required={formData.role === "student"}>
                      <InputLabel sx={{ color: isDark ? "#cbd5e1" : "#64748b" }}>{t("adminUsers.form.department")}</InputLabel>
                      <Select value={formData.departmentId} label={t("adminUsers.form.department")} onChange={field("departmentId")} sx={selectSx}>
                        <MenuItem value="">{t("adminUsers.form.chooseDept")}</MenuItem>
                        {departments.map((d) => (
                          <MenuItem key={d.id} value={d.id}>{d.emertimi}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label={t("adminUsers.form.currentSemester")}
                      type="number" fullWidth
                      value={formData.currentSemester}
                      onChange={(e) => {
                        field("currentSemester")(e);
                        if (isEdit && formData.role === "student" && formData.departmentId) {
                          loadStudentGroupContext({ ...selectedUser, departmentId: formData.departmentId, currentSemester: Number(e.target.value) });
                        }
                      }}
                      inputProps={{ min: 1, max: 12 }}
                      InputProps={{ className: "rounded-2xl!" }} sx={inputSx}
                    />
                  </Box>
                </>
              )}

              {/* Group assignment — only for student in edit mode */}
              {isEdit && formData.role === "student" && formData.departmentId && (
                <Box className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
                  <Typography className="!font-black !text-slate-800 dark:!text-white">
                    {t("adminUsers.form.groupAssignTitle")}
                  </Typography>
                  {approvedGroupLabel ? (
                    <Typography className="!text-emerald-700 dark:!text-emerald-400 !font-semibold">
                      {t("adminUsers.form.currentGroup")}{approvedGroupLabel}
                    </Typography>
                  ) : (
                    <Typography className="!text-slate-500 !text-sm">{t("adminUsers.form.noGroupMsg")}</Typography>
                  )}
                  {!approvedGroupLabel && (
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("adminUsers.form.groupLabel")}</InputLabel>
                      <Select label={t("adminUsers.form.groupLabel")} value={groupAssignId} onChange={(e) => setGroupAssignId(e.target.value)}>
                        <MenuItem value="">{t("adminUsers.form.chooseGroup")}</MenuItem>
                        {studentGroups.map((g) => (
                          <MenuItem key={g.id} value={g.id} disabled={g.isFull || g.status === "CLOSED"}>
                            {g.name} ({g.currentStudents}/{g.maxCapacity}) — {g.status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <Box className="flex gap-2 flex-wrap">
                    {!approvedGroupLabel && (
                      <Button variant="contained" size="small" disabled={!groupAssignId || groupAssignLoading} onClick={handleAssignGroup} className="!rounded-xl !normal-case !font-bold">
                        {t("adminUsers.form.assignGroup")}
                      </Button>
                    )}
                    {approvedGroupLabel && (
                      <Button variant="outlined" color="error" size="small" disabled={groupAssignLoading} onClick={handleRemoveGroup} className="!rounded-xl !normal-case !font-bold">
                        {t("adminUsers.form.removeGroup")}
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions className="px-8! pb-8! pt-4! gap-2">
            <Button onClick={() => setOpenDialog(false)}
              className="rounded-2xl! px-6! py-3! normal-case! font-bold! text-slate-500! hover:bg-slate-100! dark:hover:bg-slate-800!">
              {t("adminUsers.form.cancel")}
            </Button>
            <Button variant="contained" disabled={!formData.emri || !formData.email || (!isEdit && !formData.password)}
              onClick={handleSubmit}
              className="rounded-2xl! px-10! py-3! normal-case! font-black! bg-indigo-600! hover:bg-indigo-700! shadow-lg shadow-indigo-500/20">
              {isEdit ? t("adminUsers.form.update") : t("adminUsers.form.createAccount")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Delete confirm ── */}
        <Dialog open={openDeleteConfirm} onClose={() => { setOpenDeleteConfirm(false); setDeleteTarget(null); }}
          maxWidth="xs" fullWidth
          PaperProps={{ sx: { borderRadius: "2.5rem", p: 2, backgroundColor: isDark ? "#0f172a" : "white", border: isDark ? "1px solid #1e293b" : "1px solid rgba(148,163,184,0.15)" } }}>
          <DialogTitle className="px-6! pt-6! pb-2!">
            <Typography variant="h5" className={isDark ? "font-black! text-white!" : "font-black! text-slate-900!"}>
              {t("adminUsers.deleteTitle")}
            </Typography>
          </DialogTitle>
          <DialogContent className="px-6! py-4!">
            <Typography variant="body2" className={isDark ? "text-slate-300!" : "text-slate-600!"}>{t("adminUsers.deleteBodyPrefix")}</Typography>
            <Typography variant="body1" className={isDark ? "font-bold! text-white! mt-3!" : "font-bold! text-slate-900! mt-3!"}>
              {deleteTarget ? `${deleteTarget.emri} ${deleteTarget.mbiemri}` : ""}
            </Typography>
            <Typography variant="caption" className={isDark ? "text-slate-400!" : "text-slate-500!"}>{deleteTarget?.email}</Typography>
          </DialogContent>
          <DialogActions className="px-8! pb-8! pt-4! gap-2">
            <Button onClick={() => { setOpenDeleteConfirm(false); setDeleteTarget(null); }}
              className="rounded-2xl! px-6! py-3! normal-case! font-bold! text-slate-500! hover:bg-slate-100! dark:hover:bg-slate-800!">
              {t("adminUsers.deleteCancel")}
            </Button>
            <Button variant="contained" color="error" onClick={handleConfirmDelete}
              className="rounded-2xl! px-10! py-3! normal-case! font-black!">
              {t("adminUsers.deleteConfirm")}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <Footer />

      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }} TransitionComponent={Zoom}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} variant="filled"
          sx={{ width: "100%", borderRadius: "1.25rem", fontWeight: "bold" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

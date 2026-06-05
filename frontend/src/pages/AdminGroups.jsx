import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
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
  Zoom,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import Footer from "../components/ui/Footer";
import { useAppPreferences } from "../context/appPreferencesContext";
import GroupCreateWizard from "../components/admin/groupWizard/GroupCreateWizard";
import {
  DRAFT_STORAGE_KEY,
  applyStaffToScheduleRow,
  buildStaffBySubject,
  cardSx,
  getGroupsTheme,
  getMenuPaperSx,
  getWizardFieldSx,
  pageShellSx,
  primaryButtonSx,
  seedScheduleRowsFromStaff,
  tableContainerSx,
} from "../components/admin/groupWizard/wizardUi";
import { getAllDepartments } from "../services/departmentService";
import {
  createGroupWizard,
  deleteDepartmentGroup,
  getDepartmentGroupDetail,
  getDepartmentGroupMembers,
  getDepartmentGroups,
  getWizardContext,
  GROUP_STATUS,
  statusChipColor,
} from "../services/departmentGroupService";
import {
  getScheduleConflict,
  getScheduleConflictMessage,
} from "../utils/scheduleConflict";

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const emptyStaffRow = () => ({ subjectId: "", professorId: "", assistantId: "" });
const emptyScheduleRow = () => ({
  subjectId: "",
  professorId: "",
  assistantId: "",
  sessionType: "LECTURE",
  dayOfWeek: "MONDAY",
  startTime: "10:00",
  endTime: "",
  room: "",
});

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
}

export default function AdminGroups() {
  const navigate = useNavigate();
  const { t, colorMode } = useAppPreferences();
  const isDark = colorMode === "dark";
  const theme = getGroupsTheme(isDark);

  const DAY_LABELS = {
    MONDAY: t("adminGroups.days.MONDAY"),
    TUESDAY: t("adminGroups.days.TUESDAY"),
    WEDNESDAY: t("adminGroups.days.WEDNESDAY"),
    THURSDAY: t("adminGroups.days.THURSDAY"),
    FRIDAY: t("adminGroups.days.FRIDAY"),
    SATURDAY: t("adminGroups.days.SATURDAY"),
    SUNDAY: t("adminGroups.days.SUNDAY"),
  };

  const STATUS_FILTER_OPTIONS = [
    { value: "", label: t("adminGroups.statusAll") },
    { value: GROUP_STATUS.ACTIVE, label: t("adminGroups.statusActive") },
    { value: GROUP_STATUS.FULL, label: t("adminGroups.statusFull") },
    { value: GROUP_STATUS.CLOSED, label: t("adminGroups.statusClosed") },
  ];

  const dayOptions = DAYS.map((d) => ({ value: d, label: DAY_LABELS[d] }));

  const [view, setView] = useState("list");
  const [categories, setCategories] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [wizardStep, setWizardStep] = useState(0);
  const [context, setContext] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(30);
  const [staffRows, setStaffRows] = useState([emptyStaffRow()]);
  const [scheduleRows, setScheduleRows] = useState([emptyScheduleRow()]);
  const [wizardError, setWizardError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [detailDialog, setDetailDialog] = useState(null);
  const [membersDialog, setMembersDialog] = useState({ open: false, group: null, members: [], loading: false });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(departmentId)),
    [categories, departmentId],
  );

  const staffSubjectIds = useMemo(
    () => new Set(staffRows.map((r) => Number(r.subjectId)).filter(Boolean)),
    [staffRows],
  );

  const subjects = useMemo(() => context?.subjects || [], [context?.subjects]);
  const teachers = useMemo(() => context?.teachers || [], [context?.teachers]);

  const staffBySubject = useMemo(
    () => buildStaffBySubject(staffRows, subjects, teachers),
    [staffRows, subjects, teachers],
  );

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return groups.filter((g) => {
      if (statusFilter && g.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [g.name, g.departmentName, String(g.semester), g.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [groups, searchQuery, statusFilter]);

  const loadCategories = useCallback(async () => {
    const data = await getAllDepartments();
    setCategories(data);
    if (data.length > 0 && !departmentId) setDepartmentId(String(data[0].id));
  }, [departmentId]);

  const loadGroups = useCallback(async () => {
    if (!departmentId) return;
    setLoading(true);
    try {
      setGroups(await getDepartmentGroups(departmentId, semester));
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim gjate ngarkimit"), "error");
    } finally {
      setLoading(false);
    }
  }, [departmentId, semester]);

  useEffect(() => {
    loadCategories().catch(() => {});
  }, [loadCategories]);

  useEffect(() => {
    if (view === "list") loadGroups();
  }, [view, loadGroups]);

  useEffect(() => {
    if (view !== "wizard" || !departmentId) return;
    loadWizardContext(departmentId, semester).catch(() => {});
  }, [departmentId, semester, view]);

  const loadWizardContext = async (catId, sem) => {
    setContextLoading(true);
    try {
      const ctx = await getWizardContext(catId, sem);
      setContext(ctx);
      return ctx;
    } finally {
      setContextLoading(false);
    }
  };

  const handleScheduleChange = useCallback(
    (index, key, val) => {
      if (key === "_add") {
        setScheduleRows((rows) => [...rows, val || emptyScheduleRow()]);
        return;
      }
      if (key === "_remove") {
        setScheduleRows((rows) => (rows.length <= 1 ? rows : rows.filter((_, i) => i !== index)));
        return;
      }
      setScheduleRows((rows) =>
        rows.map((r, i) => {
          if (i !== index) return r;
          const next = { ...r, [key]: val };
          if (key === "subjectId") return applyStaffToScheduleRow(next, staffBySubject);
          return next;
        }),
      );
    },
    [staffBySubject],
  );

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (d.departmentId) setDepartmentId(String(d.departmentId));
      if (d.semester) setSemester(Number(d.semester));
      if (d.groupName) setGroupName(d.groupName);
      if (d.groupDescription) setGroupDescription(d.groupDescription);
      if (d.maxCapacity) setMaxCapacity(d.maxCapacity);
      if (d.staffRows?.length) setStaffRows(d.staffRows);
      if (d.scheduleRows?.length) setScheduleRows(d.scheduleRows);
      if (typeof d.wizardStep === "number") setWizardStep(d.wizardStep);
      return true;
    } catch {
      return false;
    }
  };

  const startWizard = async () => {
    if (!departmentId) return;
    setWizardStep(0);
    setGroupName("");
    setGroupDescription("");
    setMaxCapacity(30);
    setStaffRows([emptyStaffRow()]);
    setScheduleRows([emptyScheduleRow()]);
    setWizardError("");
    setFieldErrors({});
    setView("wizard");
    const hadDraft = restoreDraft();
    try {
      await loadWizardContext(departmentId, semester);
      if (hadDraft) showToast(t("adminGroups.draftLoaded"), "info");
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim"), "error");
    }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          departmentId,
          semester,
          groupName,
          groupDescription,
          maxCapacity,
          staffRows,
          scheduleRows,
          wizardStep,
        }),
      );
      showToast(t("adminGroups.draftSaved"));
    } catch {
      showToast(t("adminGroups.draftSaveError"), "error");
    }
  };

  const validateStep = async () => {
    const errors = {};
    if (wizardStep === 0) {
      if (!departmentId) errors.departmentId = t("adminGroups.departmentLabel");
      if (!groupName.trim()) errors.groupName = "Emri i grupit eshte i detyrueshem";
      if (Number(maxCapacity) < 1) errors.maxCapacity = "Kapaciteti duhet te jete te pakten 1";
      else {
        try {
          await loadWizardContext(departmentId, semester);
        } catch (error) {
          errors.global = getErrorMessage(error, "Gabim gjate ngarkimit");
        }
      }
    }
    if (wizardStep === 1) {
      const validStaff = staffRows.filter((r) => r.subjectId && r.professorId);
      if (validStaff.length === 0) errors.staff = "Shto te pakten nje rresht stafi (lende + profesor)";
      const validSchedules = scheduleRows.filter((r) => r.subjectId && r.professorId && r.startTime);
      if (validSchedules.length === 0) {
        errors.schedules = "Shto te pakten nje sesion orari";
      } else {
        for (let i = 0; i < validSchedules.length; i += 1) {
          const conflict = getScheduleConflict(validSchedules, validSchedules[i], i);
          const msg = getScheduleConflictMessage(conflict);
          if (msg) {
            errors.schedules = msg;
            break;
          }
        }
        const missingStaff = validSchedules.some((r) => !staffBySubject[String(r.subjectId)]?.professorId);
        if (missingStaff) {
          errors.schedules = "Disa lende nuk kane staf te caktuar ne hapin e stafit";
        }
      }
    }
    setFieldErrors(errors);
    setWizardError(errors.global || "");
    return Object.keys(errors).length === 0;
  };

  const goNext = async () => {
    setWizardError("");
    const ok = await validateStep();
    if (!ok) return;

    if (wizardStep === 1) {
      const hasValidSchedule = scheduleRows.some((r) => r.subjectId && r.startTime);
      if (!hasValidSchedule) {
        setScheduleRows(seedScheduleRowsFromStaff(staffRows, emptyScheduleRow));
      } else {
        setScheduleRows((rows) => rows.map((r) => applyStaffToScheduleRow(r, staffBySubject)));
      }
    }

    setWizardStep((s) => Math.min(s + 1, 2));
  };

  const goBack = () => {
    setFieldErrors({});
    setWizardError("");
    setWizardStep((s) => Math.max(s - 1, 0));
  };

  const buildPayload = () => ({
    departmentId: Number(departmentId),
    semester: Number(semester),
    name: groupName.trim(),
    description: groupDescription.trim() || null,
    maxCapacity: Number(maxCapacity),
    staff: staffRows
      .filter((r) => r.subjectId && r.professorId)
      .map((r) => ({
        subjectId: Number(r.subjectId),
        professorId: Number(r.professorId),
        assistantId: r.assistantId ? Number(r.assistantId) : null,
      })),
    schedules: scheduleRows
      .filter((r) => r.subjectId && r.professorId && r.startTime)
      .map((r) => ({
        subjectId: Number(r.subjectId),
        professorId: Number(r.professorId),
        assistantId: r.assistantId ? Number(r.assistantId) : null,
        sessionType: r.sessionType,
        dayOfWeek: r.dayOfWeek,
        startTime: r.startTime.length === 5 ? `${r.startTime}:00` : r.startTime,
        endTime: r.endTime
          ? r.endTime.length === 5
            ? `${r.endTime}:00`
            : r.endTime
          : null,
        room: r.room || null,
      })),
  });

  const handleSaveWizard = async () => {
    setSubmitting(true);
    setWizardError("");
    setFieldErrors({});
    try {
      await createGroupWizard(buildPayload());
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      showToast(t("adminGroups.groupCreated"));
      setView("list");
      loadGroups();
    } catch (error) {
      setWizardError(getErrorMessage(error, "Gabim gjate ruajtjes"));
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (group) => {
    try {
      setDetailDialog({ loading: true, group, data: null });
      const data = await getDepartmentGroupDetail(group.id);
      setDetailDialog({ loading: false, group, data });
    } catch (error) {
      setDetailDialog(null);
      showToast(getErrorMessage(error, "Gabim"), "error");
    }
  };

  const openMembers = async (group) => {
    setMembersDialog({ open: true, group, members: [], loading: true });
    try {
      const members = await getDepartmentGroupMembers(group.id);
      setMembersDialog({ open: true, group, members, loading: false });
    } catch (error) {
      setMembersDialog({ open: false, group: null, members: [], loading: false });
      showToast(getErrorMessage(error, "Gabim"), "error");
    }
  };

  const renderGroupActions = (group) => (
    <Box className="flex justify-end gap-0.5">
      <IconButton size="small" onClick={() => openDetail(group)} sx={{ color: theme.textMuted }}>
        <VisibilityRounded fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={() => openMembers(group)} sx={{ color: theme.textMuted }}>
        <PeopleRounded fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        color="error"
        onClick={async () => {
          if (!window.confirm(`${t("adminGroups.tableActions")} ${group.name}?`)) return;
          try {
            await deleteDepartmentGroup(group.id);
            showToast(t("adminGroups.deleted"));
            loadGroups();
          } catch (error) {
            showToast(getErrorMessage(error, "Gabim"), "error");
          }
        }}
      >
        <DeleteRounded fontSize="small" />
      </IconButton>
    </Box>
  );

  if (view === "wizard") {
    return (
      <Box sx={pageShellSx(isDark)}>
        <Container maxWidth="lg" className="py-4 mt-2 sm:mt-4">
          <GroupCreateWizard
            isDark={isDark}
            wizardStep={wizardStep}
            wizardError={wizardError}
            fieldErrors={fieldErrors}
            submitting={submitting}
            contextLoading={contextLoading}
            categories={categories}
            departmentId={departmentId}
            setDepartmentId={setDepartmentId}
            semester={semester}
            setSemester={setSemester}
            semesters={SEMESTERS}
            subjects={subjects}
            teachers={teachers}
            groupName={groupName}
            setGroupName={setGroupName}
            groupDescription={groupDescription}
            setGroupDescription={setGroupDescription}
            maxCapacity={maxCapacity}
            setMaxCapacity={setMaxCapacity}
            staffRows={staffRows}
            setStaffRows={setStaffRows}
            scheduleRows={scheduleRows}
            onScheduleChange={handleScheduleChange}
            staffSubjectIds={staffSubjectIds}
            selectedCategory={selectedCategory}
            onBack={() => setView("list")}
            onNext={goNext}
            onPrev={goBack}
            onSave={handleSaveWizard}
            onSaveDraft={saveDraft}
            emptyStaffRow={emptyStaffRow}
            emptyScheduleRow={emptyScheduleRow}
            dayOptions={dayOptions}
          />
          <Footer />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={pageShellSx(isDark)} className="flex flex-col min-h-full">
      <Container maxWidth="xl" className="py-4 mt-2 sm:mt-4 grow">
        {}
        <Box
          className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3"
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${theme.border}`,
            bgcolor: theme.card,
          }}
        >
          <IconButton size="small" onClick={() => navigate("/admin")} sx={{ color: theme.textMuted }}>
            <ArrowBackRounded />
          </IconButton>
          <Typography variant="h6" sx={{ color: theme.text, fontWeight: 900, mr: 1 }}>
            {t("adminGroups.title")}
          </Typography>

          <TextField
            size="small"
            placeholder={t("adminGroups.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[140px]"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" sx={{ color: theme.textMuted }} />
                </InputAdornment>
              ),
            }}
            sx={getWizardFieldSx(isDark)}
          />

          <FormControl size="small" sx={{ minWidth: 130, ...getWizardFieldSx(isDark) }}>
            <InputLabel>{t("adminGroups.departmentLabel")}</InputLabel>
            <Select
              label={t("adminGroups.departmentLabel")}
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              MenuProps={getMenuPaperSx(isDark)}
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.emertimi}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100, ...getWizardFieldSx(isDark) }}>
            <InputLabel>{t("adminGroups.semLabel")}</InputLabel>
            <Select
              label={t("adminGroups.semLabel")}
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              MenuProps={getMenuPaperSx(isDark)}
            >
              {SEMESTERS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 110, ...getWizardFieldSx(isDark) }}>
            <InputLabel>{t("adminGroups.statusLabel")}</InputLabel>
            <Select
              label={t("adminGroups.statusLabel")}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              MenuProps={getMenuPaperSx(isDark)}
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <MenuItem key={o.value || "all"} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddRounded />}
            onClick={startWizard}
            disabled={!departmentId}
            className="!rounded-xl !normal-case !font-bold shrink-0"
            sx={primaryButtonSx()}
          >
            {t("adminGroups.createGroup")}
          </Button>
        </Box>

        {loading ? (
          <Box className="flex justify-center py-12">
            <CircularProgress size={32} />
          </Box>
        ) : (
          <>
            {}
            <TableContainer
              className="hidden md:block rounded-2xl overflow-hidden"
              sx={tableContainerSx(isDark)}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("adminGroups.tableGrupi")}</TableCell>
                    <TableCell>{t("adminGroups.tableDept")}</TableCell>
                    <TableCell>{t("adminGroups.tableSem")}</TableCell>
                    <TableCell>{t("adminGroups.tableCapacity")}</TableCell>
                    <TableCell>{t("adminGroups.tableStatus")}</TableCell>
                    <TableCell align="right">{t("adminGroups.tableActions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: theme.textMuted }}>
                        {t("adminGroups.noGroups")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGroups.map((group) => (
                      <TableRow key={group.id} hover>
                        <TableCell>
                          <Box className="flex items-center gap-1.5 min-w-0">
                            <GroupsRounded sx={{ color: theme.accent, fontSize: 18 }} />
                            <Typography fontWeight={700} noWrap title={group.name}>
                              {group.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap title={group.departmentName || selectedCategory?.emertimi}>
                            {group.departmentName || selectedCategory?.emertimi || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>{group.semester}</TableCell>
                        <TableCell>
                          {group.currentStudents}/{group.maxCapacity}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={group.status} color={statusChipColor(group.status)} />
                        </TableCell>
                        <TableCell align="right">{renderGroupActions(group)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {}
            <Box className="md:hidden flex flex-col gap-2">
              {filteredGroups.length === 0 ? (
                <Box
                  className="rounded-xl border p-6 text-center"
                  sx={{ borderColor: theme.border, bgcolor: theme.card, color: theme.textMuted }}
                >
                  {t("adminGroups.noGroupsMobile")}
                </Box>
              ) : (
                filteredGroups.map((group) => (
                  <Card
                    key={group.id}
                    variant="outlined"
                    sx={{ ...tableContainerSx(isDark), p: 2 }}
                  >
                    <Box className="flex items-start justify-between gap-2">
                      <Box className="min-w-0">
                        <Typography fontWeight={800} sx={{ color: theme.text }} noWrap>
                          {group.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.textMuted }} noWrap>
                          {group.departmentName || selectedCategory?.emertimi} · {t("adminGroups.semLabel")} {group.semester}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.textMuted, mt: 0.5 }}>
                          {group.currentStudents}/{group.maxCapacity} {t("adminGroups.students")}
                        </Typography>
                        <Chip
                          size="small"
                          label={group.status}
                          color={statusChipColor(group.status)}
                          className="!mt-2"
                        />
                      </Box>
                      {renderGroupActions(group)}
                    </Box>
                  </Card>
                ))
              )}
            </Box>
          </>
        )}

        <Dialog
          open={Boolean(detailDialog)}
          onClose={() => setDetailDialog(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: cardSx(isDark) }}
        >
          <DialogTitle sx={{ color: theme.text, fontWeight: 800 }}>
            {t("adminGroups.detailTitle")}{detailDialog?.group?.name || ""}
          </DialogTitle>
          <DialogContent sx={{ color: theme.text }}>
            {detailDialog?.loading ? (
              <CircularProgress size={28} />
            ) : (
              <Table size="small" sx={tableContainerSx(isDark)}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("adminGroups.detailDay")}</TableCell>
                    <TableCell>{t("adminGroups.detailTime")}</TableCell>
                    <TableCell>{t("adminGroups.detailSubject")}</TableCell>
                    <TableCell>{t("adminGroups.detailProfessor")}</TableCell>
                    <TableCell>{t("adminGroups.detailRoom")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(detailDialog?.data?.schedules || []).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{DAY_LABELS[s.dayOfWeek] || s.dayOfWeek}</TableCell>
                      <TableCell>
                        {String(s.startTime).slice(0, 5)} – {String(s.endTime).slice(0, 5)}
                      </TableCell>
                      <TableCell>{s.subjectTitle}</TableCell>
                      <TableCell>{s.teacherName}</TableCell>
                      <TableCell>{s.room || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialog(null)}>{t("adminGroups.close")}</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={membersDialog.open}
          onClose={() => setMembersDialog({ open: false, group: null, members: [], loading: false })}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: cardSx(isDark) }}
        >
          <DialogTitle sx={{ color: theme.text, fontWeight: 800 }}>
            {t("adminGroups.membersTitle")}{membersDialog.group?.name}
          </DialogTitle>
          <DialogContent sx={{ color: theme.text }}>
            {membersDialog.loading ? (
              <CircularProgress size={28} />
            ) : membersDialog.members.length === 0 ? (
              <Typography sx={{ color: theme.textMuted }}>{t("adminGroups.noStudents")}</Typography>
            ) : (
              membersDialog.members.map((m) => (
                <Typography key={m.userId} variant="body2" sx={{ py: 0.5 }}>
                  {m.firstName} {m.lastName} ({m.email})
                </Typography>
              ))
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setMembersDialog({ open: false, group: null, members: [], loading: false })}
            >
              {t("adminGroups.close")}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          TransitionComponent={Zoom}
        >
          <Alert severity={toast.severity}>{toast.message}</Alert>
        </Snackbar>
      </Container>
      <Footer />
    </Box>
  );
}

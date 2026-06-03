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
  Tooltip,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
import Footer from "../components/ui/Footer";
import axiosInstance from "../services/axiosInstance";

const EMPTY_FORM = { emertimi: "", normalizedName: "", pershkrimi: "" };

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function AdminRoles() {
  const navigate = useNavigate();
  const { mode } = useAppPreferences();
  const isDark = mode === "dark";

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const showToast = useCallback((message, severity = "success") => {
    setSnackbarSeverity(severity);
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  }, []);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/roles");
      setRoles(data);
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim gjatë marrjes së roleve"), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const filteredRoles = roles.filter(
    (r) =>
      r.emertimi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.normalizedName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.pershkrimi?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openAddDialog = () => {
    setIsEdit(false);
    setSelectedRole(null);
    setFormData(EMPTY_FORM);
    setOpenDialog(true);
  };

  const openEditDialog = (role) => {
    setIsEdit(true);
    setSelectedRole(role);
    setFormData({
      emertimi: role.emertimi || "",
      normalizedName: role.normalizedName || "",
      pershkrimi: role.pershkrimi || "",
    });
    setOpenDialog(true);
  };

  const handleFieldChange = (key) => (e) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!formData.emertimi.trim() || !formData.normalizedName.trim()) {
      showToast("Emertimi dhe Normalized Name janë të detyrueshme", "error");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && selectedRole) {
        await axiosInstance.put(`/roles/${selectedRole.id}`, formData);
        showToast("Roli u përditësua me sukses");
      } else {
        await axiosInstance.post("/roles", formData);
        showToast("Roli u krijua me sukses");
      }
      setOpenDialog(false);
      await loadRoles();
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim gjatë ruajtjes"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await axiosInstance.delete(`/roles/${deleteTarget.id}`);
      showToast("Roli u fshi me sukses");
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      await loadRoles();
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim gjatë fshirjes"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const cardCls = `rounded-3xl border ${isDark ? "border-slate-700/60" : "bg-white border-slate-200/60"} shadow-sm`;
  const headCellSx = { fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: isDark ? "#94a3b8" : "#64748b" };
  const inputSx = {
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    input: {
      color: isDark ? "#f8fafc" : "#0f172a",
      "&::placeholder": { color: isDark ? "rgba(226,232,240,0.7)" : "rgba(100,116,139,0.75)" },
    },
  };

  return (
    <section className={`flex flex-col min-h-screen ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      <Container maxWidth="lg" className="grow py-8 mt-4 sm:mt-8">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/admin")}
          className="mb-6! normal-case! text-slate-600! dark:text-slate-400!"
        >
          Kthehu te Paneli
        </Button>

        <Box className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Box className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <AdminPanelSettingsRounded className="text-violet-600 text-xl!" />
              </div>
              <Typography variant="h4" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
                Menaxhimi i Roleve
              </Typography>
            </Box>
            <Typography variant="body1" className="text-slate-600! dark:text-slate-400!">
              Krijo, modifiko dhe fshi rolet e sistemit.
            </Typography>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <TextField
              placeholder="Kërko rol..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded className="text-slate-400" />
                    </InputAdornment>
                  ),
                  className: "rounded-3xl! bg-white! dark:bg-slate-900! border-none! shadow-sm",
                },
              }}
              sx={inputSx}
            />
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={openAddDialog}
              className="rounded-xl! py-2.5! px-6! normal-case! font-bold! bg-violet-600! hover:bg-violet-700! shadow-lg shadow-violet-500/20"
            >
              Shto Rol
            </Button>
          </div>
        </Box>

        <Card className={cardCls} sx={{ backgroundColor: isDark ? "#0f172a" : "#fff", backgroundImage: "none" }}>
          {loading ? (
            <Box className="flex justify-center py-16">
              <CircularProgress className="text-violet-500!" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headCellSx}>ID</TableCell>
                    <TableCell sx={headCellSx}>Emërtimi</TableCell>
                    <TableCell sx={headCellSx}>Normalized Name</TableCell>
                    <TableCell sx={headCellSx}>Përshkrimi</TableCell>
                    <TableCell sx={headCellSx} align="right">Veprimet</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ fontSize: "0.85rem" }}>
                        Nuk u gjetën role.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell sx={{ fontSize: "0.85rem" }}>{role.id}</TableCell>
                        <TableCell>
                          <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            {role.emertimi}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-widest ${isDark ? "bg-violet-900/40 text-violet-300" : "bg-violet-100 text-violet-700"}`}>
                            {role.normalizedName}
                          </span>
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.85rem" }}>{role.pershkrimi || "—"}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Modifiko" slots={{ transition: Zoom }}>
                            <IconButton size="small" onClick={() => openEditDialog(role)}
                              className="text-sky-500! hover:bg-sky-50! dark:hover:bg-sky-900/30!">
                              <EditRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Fshi" slots={{ transition: Zoom }}>
                            <IconButton size="small" onClick={() => { setDeleteTarget(role); setOpenDeleteConfirm(true); }}
                              className="text-red-500! hover:bg-red-50! dark:hover:bg-red-900/30!">
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: "1.5rem", backgroundColor: isDark ? "#0f172a" : "#fff", backgroundImage: "none" } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a" }}>
          {isEdit ? "Modifiko Rolin" : "Shto Rol të Ri"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-4!">
          {[
            { label: "Emërtimi *", key: "emertimi" },
            { label: "Normalized Name *", key: "normalizedName", helper: "P.sh. ADMIN, TEACHER, STUDENT" },
            { label: "Përshkrimi", key: "pershkrimi", multiline: true, rows: 2 },
          ].map(({ label, key, helper, multiline, rows }) => (
            <TextField
              key={key}
              label={label}
              value={formData[key]}
              onChange={handleFieldChange(key)}
              fullWidth
              size="small"
              helperText={helper}
              multiline={multiline}
              rows={rows}
              sx={{
                "& .MuiInputLabel-root": { color: isDark ? "#94a3b8" : "#64748b" },
                "& .MuiInputBase-input": { color: isDark ? "#f8fafc" : "#0f172a" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#334155" : "#cbd5e1" },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#475569" : "#94a3b8" },
                "& .MuiFormHelperText-root": { color: isDark ? "#64748b" : "#94a3b8" },
              }}
            />
          ))}
        </DialogContent>
        <DialogActions className="p-4!">
          <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: "none", color: isDark ? "#94a3b8" : "#475569" }}>
            Anulo
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ textTransform: "none", borderRadius: "0.75rem", backgroundColor: "#7c3aed", "&:hover": { backgroundColor: "#6d28d9" } }}
          >
            {submitting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : isEdit ? "Ruaj" : "Krijo"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: "1.5rem", backgroundColor: isDark ? "#0f172a" : "#fff", backgroundImage: "none" } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a" }}>Konfirmo Fshirjen</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ borderRadius: "1rem" }}>
            A jeni i sigurt që doni të fshini rolin <strong>{deleteTarget?.emertimi}</strong>?
            Roli nuk mund të fshihet nëse ka përdorues me këtë rol.
          </Alert>
        </DialogContent>
        <DialogActions className="p-4!">
          <Button onClick={() => setOpenDeleteConfirm(false)} sx={{ textTransform: "none", color: isDark ? "#94a3b8" : "#475569" }}>
            Anulo
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={submitting}
            sx={{ textTransform: "none", borderRadius: "0.75rem" }}
          >
            {submitting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Fshi"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3500}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbarSeverity} className="rounded-2xl! shadow-lg">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Footer />
    </section>
  );
}

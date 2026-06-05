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
  Autocomplete,
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
import LabelRounded from "@mui/icons-material/LabelRounded";
import Footer from "../components/ui/Footer";
import axiosInstance from "../services/axiosInstance";

const EMPTY_FORM = { userId: null, claimType: "", claimValue: "", _customType: "" };

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function AdminUserClaims() {
  const navigate = useNavigate();
  const { mode, t } = useAppPreferences();
  const isDark = mode === "dark";

  const [claims, setClaims] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [claimsRes, usersRes] = await Promise.all([
        axiosInstance.get("/user-claims"),
        axiosInstance.get("/users"),
      ]);
      setClaims(claimsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      showToast(getErrorMessage(error, t("adminUserClaims.toast.fetchError")), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredClaims = claims.filter(
    (c) =>
      c.claimType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.claimValue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${c.emri} ${c.mbiemri}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openAddDialog = () => {
    setIsEdit(false);
    setSelectedClaim(null);
    setFormData(EMPTY_FORM);
    setOpenDialog(true);
  };

  const openEditDialog = (claim) => {
    setIsEdit(true);
    setSelectedClaim(claim);
    setFormData({
      userId: claim.userId,
      claimType: claim.claimType || "",
      claimValue: claim.claimValue || "",
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    const resolvedType = formData.claimType === "custom"
      ? (formData._customType || "").trim()
      : formData.claimType.trim();

    if (!formData.userId || !resolvedType || !formData.claimValue.trim()) {
      showToast(t("adminUserClaims.toast.validationError"), "error");
      return;
    }
    const payload = { userId: formData.userId, claimType: resolvedType, claimValue: formData.claimValue.trim() };
    setSubmitting(true);
    try {
      if (isEdit && selectedClaim) {
        await axiosInstance.put(`/user-claims/${selectedClaim.id}`, payload);
        showToast(t("adminUserClaims.toast.updated"));
      } else {
        await axiosInstance.post("/user-claims", payload);
        showToast(t("adminUserClaims.toast.created"));
      }
      setOpenDialog(false);
      await loadData();
    } catch (error) {
      showToast(getErrorMessage(error, t("adminUserClaims.toast.saveError")), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await axiosInstance.delete(`/user-claims/${deleteTarget.id}`);
      showToast(t("adminUserClaims.toast.deleted"));
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      showToast(getErrorMessage(error, t("adminUserClaims.toast.deleteError")), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedUser = users.find((u) => u.id === formData.userId) || null;

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
          {t("adminUserClaims.backToPanel")}
        </Button>

        <Box className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Box className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                <LabelRounded className="text-teal-600 text-xl!" />
              </div>
              <Typography variant="h4" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
                {t("adminUserClaims.title")}
              </Typography>
            </Box>
            <Typography variant="body1" className="text-slate-600! dark:text-slate-400!">
              {t("adminUserClaims.subtitle")}
            </Typography>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <TextField
              placeholder={t("adminUserClaims.searchPlaceholder")}
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
              className="rounded-xl! py-2.5! px-6! normal-case! font-bold! bg-teal-600! hover:bg-teal-700! shadow-lg shadow-teal-500/20"
            >
              {t("adminUserClaims.addBtn")}
            </Button>
          </div>
        </Box>

        <Card className={cardCls} sx={{ backgroundColor: isDark ? "#0f172a" : "#fff", backgroundImage: "none" }}>
          {loading ? (
            <Box className="flex justify-center py-16">
              <CircularProgress className="text-teal-500!" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headCellSx}>{t("adminUserClaims.tableId")}</TableCell>
                    <TableCell sx={headCellSx}>{t("adminUserClaims.tableUser")}</TableCell>
                    <TableCell sx={headCellSx}>{t("adminUserClaims.tableClaimType")}</TableCell>
                    <TableCell sx={headCellSx}>{t("adminUserClaims.tableClaimValue")}</TableCell>
                    <TableCell sx={headCellSx} align="right">{t("adminUserClaims.tableActions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClaims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ fontSize: "0.85rem" }}>
                        {t("adminUserClaims.noClaims")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClaims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell sx={{ fontSize: "0.85rem" }}>{claim.id}</TableCell>
                        <TableCell>
                          <div className={`font-semibold text-sm ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            {claim.emri} {claim.mbiemri}
                          </div>
                          <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{claim.email}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold ${isDark ? "bg-teal-900/40 text-teal-300" : "bg-teal-100 text-teal-700"}`}>
                            {claim.claimType}
                          </span>
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.85rem" }}>{claim.claimValue}</TableCell>
                        <TableCell align="right">
                          <Tooltip title={t("adminUserClaims.tooltipEdit")} slots={{ transition: Zoom }}>
                            <IconButton size="small" onClick={() => openEditDialog(claim)}
                              className="text-sky-500! hover:bg-sky-50! dark:hover:bg-sky-900/30!">
                              <EditRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("adminUserClaims.tooltipDelete")} slots={{ transition: Zoom }}>
                            <IconButton size="small" onClick={() => { setDeleteTarget(claim); setOpenDeleteConfirm(true); }}
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
          {isEdit ? t("adminUserClaims.editDialogTitle") : t("adminUserClaims.addDialogTitle")}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-4!">

          {/* User */}
          <Autocomplete
            options={users}
            getOptionLabel={(u) => `${u.emri} ${u.mbiemri} (${u.email})`}
            value={selectedUser}
            onChange={(_, val) => setFormData((p) => ({ ...p, userId: val?.id ?? null }))}
            renderInput={(params) => (
              <TextField {...params} label={t("adminUserClaims.fieldUser")} size="small"
                sx={{
                  "& .MuiInputLabel-root": { color: isDark ? "#94a3b8" : "#64748b" },
                  "& .MuiInputBase-input": { color: isDark ? "#f8fafc" : "#0f172a" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#334155" : "#cbd5e1" },
                }}
              />
            )}
          />

          {/* Claim Type — Select */}
          <FormControl size="small" fullWidth>
            <InputLabel sx={{ color: isDark ? "#94a3b8" : "#64748b" }}>{t("adminUserClaims.fieldClaimType")}</InputLabel>
            <Select
              value={formData.claimType}
              label={t("adminUserClaims.fieldClaimType")}
              onChange={(e) => setFormData((p) => ({ ...p, claimType: e.target.value }))}
              sx={{
                color: isDark ? "#f8fafc" : "#0f172a",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#334155" : "#cbd5e1" },
              }}
            >
              <MenuItem value="permission">{t("adminUserClaims.claimTypePermission")}</MenuItem>
              <MenuItem value="department">{t("adminUserClaims.claimTypeDepartment")}</MenuItem>
              <MenuItem value="feature">{t("adminUserClaims.claimTypeFeature")}</MenuItem>
              <MenuItem value="custom">{t("adminUserClaims.claimTypeCustom")}</MenuItem>
            </Select>
          </FormControl>

          {/* Nëse custom, trego text field për type */}
          {formData.claimType === "custom" && (
            <TextField
              label={t("adminUserClaims.fieldClaimTypeCustom")}
              value={formData._customType ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, _customType: e.target.value }))}
              fullWidth size="small" placeholder={t("adminUserClaims.fieldClaimTypePlaceholder")}
              sx={{
                "& .MuiInputLabel-root": { color: isDark ? "#94a3b8" : "#64748b" },
                "& .MuiInputBase-input": { color: isDark ? "#f8fafc" : "#0f172a" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#334155" : "#cbd5e1" },
              }}
            />
          )}

          {/* Claim Value */}
          <TextField
            label={t("adminUserClaims.fieldClaimValue")}
            value={formData.claimValue}
            onChange={(e) => setFormData((p) => ({ ...p, claimValue: e.target.value }))}
            fullWidth size="small"
            placeholder={
              formData.claimType === "permission" ? t("adminUserClaims.claimValuePlaceholderPermission") :
              formData.claimType === "department" ? t("adminUserClaims.claimValuePlaceholderDepartment") :
              formData.claimType === "feature"     ? t("adminUserClaims.claimValuePlaceholderFeature") :
              t("adminUserClaims.claimValuePlaceholderDefault")
            }
            sx={{
              "& .MuiInputLabel-root": { color: isDark ? "#94a3b8" : "#64748b" },
              "& .MuiInputBase-input": { color: isDark ? "#f8fafc" : "#0f172a" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#334155" : "#cbd5e1" },
            }}
          />

          {/* Preview */}
          {(formData.claimType && formData.claimValue) && (
            <Box className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
              <Typography variant="caption" className="text-teal-700! dark:text-teal-400! font-semibold!">
                {t("adminUserClaims.authorityLabel")}
              </Typography>
              <Chip
                label={`${formData.claimType === "custom" ? (formData._customType || "custom") : formData.claimType}:${formData.claimValue}`}
                size="small"
                sx={{
                  backgroundColor: isDark ? "rgba(20,184,166,0.2)" : "rgba(20,184,166,0.15)",
                  color: isDark ? "#5eead4" : "#0f766e",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions className="p-4!">
          <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: "none", color: isDark ? "#94a3b8" : "#475569" }}>
            {t("adminUserClaims.cancel")}
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}
            sx={{ textTransform: "none", borderRadius: "0.75rem", backgroundColor: "#0d9488", "&:hover": { backgroundColor: "#0f766e" } }}>
            {submitting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : isEdit ? t("adminUserClaims.save") : t("adminUserClaims.create")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { className: "rounded-3xl! dark:bg-slate-900!" } }}>
        <DialogTitle className="font-bold! text-slate-900! dark:text-white!">{t("adminUserClaims.deleteTitle")}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" className="rounded-2xl!">
            {t("adminUserClaims.deleteWarning")} <strong>{deleteTarget?.claimType}</strong> {t("adminUserClaims.deleteWarningFor")}{" "}
            <strong>{deleteTarget?.emri} {deleteTarget?.mbiemri}</strong>?
          </Alert>
        </DialogContent>
        <DialogActions className="p-4!">
          <Button onClick={() => setOpenDeleteConfirm(false)} className="normal-case! text-slate-600! dark:text-slate-400!">
            {t("adminUserClaims.cancel")}
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={submitting}
            className="normal-case! rounded-xl!">
            {submitting ? <CircularProgress size={18} className="text-white!" /> : t("adminUserClaims.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={3500} onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbarSeverity} className="rounded-2xl! shadow-lg">{snackbarMessage}</Alert>
      </Snackbar>

      <Footer />
    </section>
  );
}

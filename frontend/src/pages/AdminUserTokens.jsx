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
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import TokenRounded from "@mui/icons-material/TokenRounded";
import Footer from "../components/ui/Footer";
import axiosInstance from "../services/axiosInstance";

const EMPTY_FORM = { userId: null, loginProvider: "", tokenName: "", tokenValue: "" };

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function AdminUserTokens() {
  const navigate = useNavigate();
  const { mode } = useAppPreferences();
  const isDark = mode === "dark";

  const [tokens, setTokens] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
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
      const [tokensRes, usersRes] = await Promise.all([
        axiosInstance.get("/user-tokens"),
        axiosInstance.get("/users"),
      ]);
      setTokens(tokensRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim gjatë ngarkimit të të dhënave"), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredTokens = tokens.filter(
    (t) =>
      t.loginProvider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tokenName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${t.emri} ${t.mbiemri}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openAddDialog = () => {
    setIsEdit(false);
    setSelectedToken(null);
    setFormData(EMPTY_FORM);
    setOpenDialog(true);
  };

  const openEditDialog = (token) => {
    setIsEdit(true);
    setSelectedToken(token);
    setFormData({
      userId: token.userId,
      loginProvider: token.loginProvider || "",
      tokenName: token.tokenName || "",
      tokenValue: token.tokenValue || "",
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.userId || !formData.loginProvider.trim() || !formData.tokenName.trim() || !formData.tokenValue.trim()) {
      showToast("Të gjitha fushat janë të detyrueshme", "error");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && selectedToken) {
        await axiosInstance.put(`/user-tokens/${selectedToken.id}`, formData);
        showToast("Token u përditësua me sukses");
      } else {
        await axiosInstance.post("/user-tokens", formData);
        showToast("Token u krijua me sukses");
      }
      setOpenDialog(false);
      await loadData();
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
      await axiosInstance.delete(`/user-tokens/${deleteTarget.id}`);
      showToast("Token u fshi me sukses");
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      showToast(getErrorMessage(error, "Gabim gjatë fshirjes"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedUser = users.find((u) => u.id === formData.userId) || null;

  const truncate = (str, n = 32) => (str?.length > n ? str.slice(0, n) + "…" : str);

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
              <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <TokenRounded className="text-orange-600 text-xl!" />
              </div>
              <Typography variant="h4" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
                User Tokens
              </Typography>
            </Box>
            <Typography variant="body1" className="text-slate-600! dark:text-slate-400!">
              Shikon tokenat aktivë të sesioneve. Krijohen automatikisht gjatë login dhe fshihen gjatë logout.
            </Typography>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <TextField
              placeholder="Kërko token..."
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
              className="rounded-xl! py-2.5! px-6! normal-case! font-bold! bg-orange-600! hover:bg-orange-700! shadow-lg shadow-orange-500/20"
            >
              Shto Token
            </Button>
          </div>
        </Box>

        <Card className={cardCls} sx={{ backgroundColor: isDark ? "#0f172a" : "#fff", backgroundImage: "none" }}>
          {loading ? (
            <Box className="flex justify-center py-16">
              <CircularProgress className="text-orange-500!" />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headCellSx}>ID</TableCell>
                    <TableCell sx={headCellSx}>Përdoruesi</TableCell>
                    <TableCell sx={headCellSx}>Login Provider</TableCell>
                    <TableCell sx={headCellSx}>Token Name</TableCell>
                    <TableCell sx={headCellSx}>Token Value</TableCell>
                    <TableCell sx={headCellSx} align="right">Veprimet</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTokens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ fontSize: "0.85rem" }}>
                        Nuk u gjetën tokenë.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTokens.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell sx={{ fontSize: "0.85rem" }}>{token.id}</TableCell>
                        <TableCell>
                          <div className={`font-semibold text-sm ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            {token.emri} {token.mbiemri}
                          </div>
                          <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{token.email}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold ${isDark ? "bg-orange-900/40 text-orange-300" : "bg-orange-100 text-orange-700"}`}>
                            {token.loginProvider}
                          </span>
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.85rem" }}>{token.tokenName}</TableCell>
                        <TableCell>
                          <Tooltip title={token.tokenValue} arrow>
                            <span className={`text-xs font-mono cursor-help ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              {truncate(token.tokenValue)}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Modifiko" slots={{ transition: Zoom }}>
                            <IconButton size="small" onClick={() => openEditDialog(token)}
                              className="text-sky-500! hover:bg-sky-50! dark:hover:bg-sky-900/30!">
                              <EditRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Fshi" slots={{ transition: Zoom }}>
                            <IconButton size="small" onClick={() => { setDeleteTarget(token); setOpenDeleteConfirm(true); }}
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
        slotProps={{ paper: { className: "rounded-3xl! dark:bg-slate-900!" } }}>
        <DialogTitle className="font-bold! text-slate-900! dark:text-white!">
          {isEdit ? "Modifiko Token" : "Shto Token të Ri"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-4!">
          <Autocomplete
            options={users}
            getOptionLabel={(u) => `${u.emri} ${u.mbiemri} (${u.email})`}
            value={selectedUser}
            onChange={(_, val) => setFormData((p) => ({ ...p, userId: val?.id ?? null }))}
            renderInput={(params) => (
              <TextField {...params} label="Përdoruesi *" size="small"
                slotProps={{ inputLabel: { className: "dark:text-slate-400!" } }} />
            )}
          />
          <TextField label="Login Provider *" value={formData.loginProvider}
            onChange={(e) => setFormData((p) => ({ ...p, loginProvider: e.target.value }))}
            fullWidth size="small" helperText='P.sh. "Google", "GitHub", "Local"'
            slotProps={{
              inputLabel: { className: "dark:text-slate-400!" },
              htmlInput: { className: "dark:text-white!" },
            }} />
          <TextField label="Token Name *" value={formData.tokenName}
            onChange={(e) => setFormData((p) => ({ ...p, tokenName: e.target.value }))}
            fullWidth size="small" helperText='P.sh. "access_token", "id_token"'
            slotProps={{
              inputLabel: { className: "dark:text-slate-400!" },
              htmlInput: { className: "dark:text-white!" },
            }} />
          <TextField label="Token Value *" value={formData.tokenValue}
            onChange={(e) => setFormData((p) => ({ ...p, tokenValue: e.target.value }))}
            fullWidth size="small" multiline rows={3}
            slotProps={{
              inputLabel: { className: "dark:text-slate-400!" },
              htmlInput: { className: "dark:text-white! font-mono text-xs" },
            }} />
        </DialogContent>
        <DialogActions className="p-4!">
          <Button onClick={() => setOpenDialog(false)} className="normal-case! text-slate-600! dark:text-slate-400!">
            Anulo
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}
            className="normal-case! rounded-xl! bg-orange-600! hover:bg-orange-700!">
            {submitting ? <CircularProgress size={18} className="text-white!" /> : isEdit ? "Ruaj" : "Krijo"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { className: "rounded-3xl! dark:bg-slate-900!" } }}>
        <DialogTitle className="font-bold! text-slate-900! dark:text-white!">Konfirmo Fshirjen</DialogTitle>
        <DialogContent>
          <Alert severity="warning" className="rounded-2xl!">
            A jeni i sigurt që doni të fshini token-in <strong>{deleteTarget?.tokenName}</strong> të{" "}
            <strong>{deleteTarget?.emri} {deleteTarget?.mbiemri}</strong>?
          </Alert>
        </DialogContent>
        <DialogActions className="p-4!">
          <Button onClick={() => setOpenDeleteConfirm(false)} className="normal-case! text-slate-600! dark:text-slate-400!">
            Anulo
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={submitting}
            className="normal-case! rounded-xl!">
            {submitting ? <CircularProgress size={18} className="text-white!" /> : "Fshi"}
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

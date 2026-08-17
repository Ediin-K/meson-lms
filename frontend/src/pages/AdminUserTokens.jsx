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
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import TokenRounded from "@mui/icons-material/TokenRounded";
import Footer from "../components/ui/Footer";
import axiosInstance from "../services/axiosInstance";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function AdminUserTokens() {
  const navigate = useNavigate();
  const { mode, t } = useAppPreferences();
  const isDark = mode === "dark";

  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
      const { data } = await axiosInstance.get("/user-tokens");
      setTokens(data);
    } catch (error) {
      showToast(getErrorMessage(error, t("adminUserTokens.toast.fetchError")), "error");
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
          {t("adminUserTokens.backToPanel")}
        </Button>

        <Box className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Box className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <TokenRounded className="text-orange-600 text-xl!" />
              </div>
              <Typography variant="h4" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
                {t("adminUserTokens.title")}
              </Typography>
            </Box>
            <Typography variant="body1" className="text-slate-600! dark:text-slate-400!">
              {t("adminUserTokens.subtitle")}
            </Typography>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <TextField
              placeholder={t("adminUserTokens.searchPlaceholder")}
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
                    <TableCell sx={headCellSx}>{t("adminUserTokens.tableId")}</TableCell>
                    <TableCell sx={headCellSx}>{t("adminUserTokens.tableUser")}</TableCell>
                    <TableCell sx={headCellSx}>{t("adminUserTokens.tableLoginProvider")}</TableCell>
                    <TableCell sx={headCellSx}>{t("adminUserTokens.tableTokenName")}</TableCell>
                    <TableCell sx={headCellSx}>{t("adminUserTokens.tableTokenValue")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTokens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ fontSize: "0.85rem" }}>
                        {t("adminUserTokens.noTokens")}
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Container>

      <Snackbar open={openSnackbar} autoHideDuration={3500} onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbarSeverity} className="rounded-2xl! shadow-lg">{snackbarMessage}</Alert>
      </Snackbar>

      <Footer />
    </section>
  );
}

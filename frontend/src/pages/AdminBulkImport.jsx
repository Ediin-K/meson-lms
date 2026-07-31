import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../context/appPreferencesContext";
import {
  Typography, Container, Box, Card, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Snackbar, Alert, Zoom, Grid,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import UploadFileRounded from "@mui/icons-material/UploadFileRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import Footer from "../components/ui/Footer";
import axiosInstance from "../services/axiosInstance";

function downloadCredentialsCsv(credentials) {
  const header = "emri,mbiemri,email,tempPassword";
  const lines = credentials.map((c) => [c.emri, c.mbiemri, c.email, c.tempPassword].join(","));
  const csv = [header, ...lines].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "temp-passwords.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminBulkImport() {
  const navigate = useNavigate();
  const { t } = useAppPreferences();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const showToast = (msg, sev = "success") => {
    setSnackbarMessage(msg); setSnackbarSeverity(sev); setOpenSnackbar(true);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      showToast(t("adminBulkImport.toast.fileRequired"), "error");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await axiosInstance.post("/users/bulk-import", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      showToast(t("adminBulkImport.toast.processed"));
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message
          || t("adminBulkImport.toast.uploadError");
      showToast(typeof msg === "string" ? msg : t("adminBulkImport.toast.uploadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 grow">

        {/* Header */}
        <Box className="flex items-center justify-between mb-8">
          <Button startIcon={<ArrowBackRounded />} onClick={() => navigate("/admin")}
            className="rounded-2xl! px-6! py-2! normal-case! font-bold! text-slate-600! dark:text-slate-400! hover:bg-slate-200/50! dark:hover:bg-slate-800/50!">
            {t("home.admin.services.backToPanel")}
          </Button>
        </Box>

        {/* Title */}
        <Box className="mb-10">
          <Typography variant="overline" className="font-bold! tracking-[0.3em]! text-indigo-600! dark:text-indigo-400!">
            {t("adminBulkImport.overline")}
          </Typography>
          <Typography variant="h3" component="h1" className="mt-2! font-black! text-slate-900! dark:text-white!">
            {t("adminBulkImport.title")}
          </Typography>
          <Typography variant="body1" className="mt-3! text-slate-500! dark:text-slate-400!">
            {t("adminBulkImport.subtitle")}
          </Typography>
        </Box>

        {/* Upload card */}
        <Card elevation={0} className="rounded-[2.5rem]! border border-slate-200/60 bg-white/80 dark:bg-slate-900/50! overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-none mb-8">
          <Box className="p-8 flex flex-col gap-4">
            <Typography variant="h6" className="font-black! text-slate-800! dark:text-white!">
              {t("adminBulkImport.uploadCard.heading")}
            </Typography>
            <Typography variant="body2" className="text-slate-500! dark:text-slate-400!">
              {t("adminBulkImport.uploadCard.hint")}
            </Typography>

            <Box className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outlined"
                startIcon={<UploadFileRounded />}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl! px-6! py-3! normal-case! font-bold!"
              >
                {t("adminBulkImport.uploadCard.chooseFile")}
              </Button>
              <Typography variant="body2" className="text-slate-500! dark:text-slate-400! font-medium!">
                {file ? file.name : t("adminBulkImport.uploadCard.noFileChosen")}
              </Typography>
            </Box>

            <Box className="mt-4">
              <Button
                variant="contained"
                disabled={!file || loading}
                onClick={handleSubmit}
                className="rounded-2xl! px-10! py-3! normal-case! font-black! bg-indigo-600! hover:bg-indigo-700! shadow-lg shadow-indigo-500/20"
              >
                {loading
                  ? <><CircularProgress size={18} className="text-white! mr-2!" />{t("adminBulkImport.uploadCard.submitting")}</>
                  : t("adminBulkImport.uploadCard.submit")}
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Results */}
        {result && (
          <>
            <Grid container spacing={3} className="mb-8">
              {[
                { label: t("adminBulkImport.summary.total"), value: result.totalRows, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
                { label: t("adminBulkImport.summary.success"), value: result.successCount, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                { label: t("adminBulkImport.summary.failed"), value: result.failureCount, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
              ].map((s, i) => (
                <Grid item xs={12} sm={4} key={i}>
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

            {result.credentials.length > 0 && (
              <Card elevation={0} className="rounded-[2.5rem]! border border-amber-200/60 bg-white/80 dark:bg-slate-900/50! dark:border-amber-900/40! overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-none mb-8">
                <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 p-6 dark:border-slate-800">
                  <Box className="flex items-center gap-3">
                    <WarningAmberRounded className="text-amber-500!" />
                    <Box>
                      <Typography variant="h6" className="font-black! text-slate-800! dark:text-white!">
                        {t("adminBulkImport.credentials.heading")}
                      </Typography>
                      <Typography variant="caption" className="text-amber-600! dark:text-amber-400! font-semibold!">
                        {t("adminBulkImport.credentials.warning")}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadRounded />}
                    onClick={() => downloadCredentialsCsv(result.credentials)}
                    className="rounded-2xl! px-6! py-2! normal-case! font-bold! shrink-0"
                  >
                    {t("adminBulkImport.credentials.download")}
                  </Button>
                </Box>

                <TableContainer>
                  <Table sx={{ minWidth: 600 }}>
                    <TableHead className="bg-slate-50/50 dark:bg-slate-800/30!">
                      <TableRow>
                        {[
                          t("adminBulkImport.credentials.name"),
                          t("adminBulkImport.credentials.email"),
                          t("adminBulkImport.credentials.password"),
                        ].map((h, i) => (
                          <TableCell key={i} className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-5!" sx={{ paddingLeft: i === 0 ? "2rem" : undefined }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.credentials.map((cred, i) => (
                        <TableRow key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <TableCell className="pl-8! py-5! font-bold! text-slate-900! dark:text-white!">
                            {cred.emri} {cred.mbiemri}
                          </TableCell>
                          <TableCell className="text-slate-600! dark:text-slate-300!">{cred.email}</TableCell>
                          <TableCell className="font-mono! text-slate-900! dark:text-white! font-semibold!">{cred.tempPassword}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}

            <Card elevation={0} className="rounded-[2.5rem]! border border-slate-200/60 bg-white/80 dark:bg-slate-900/50! overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-none">
              <Box className="border-b border-slate-100 p-6 dark:border-slate-800">
                <Typography variant="h6" className="font-black! text-slate-800! dark:text-white!">
                  {t("adminBulkImport.table.heading")}
                </Typography>
              </Box>

              {result.failures.length === 0 ? (
                <Box className="flex flex-col items-center justify-center gap-4 py-24">
                  <CheckCircleRounded className="text-6xl! text-emerald-300 dark:text-emerald-700" />
                  <Typography variant="h6" className="font-black! text-slate-800! dark:text-white!">
                    {t("adminBulkImport.empty.title")}
                  </Typography>
                  <Typography variant="body2" className="text-slate-400!">
                    {t("adminBulkImport.empty.description")}
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead className="bg-slate-50/50 dark:bg-slate-800/30!">
                      <TableRow>
                        {[
                          t("adminBulkImport.table.name"),
                          t("adminBulkImport.table.email"),
                          t("adminBulkImport.table.role"),
                          t("adminBulkImport.table.department"),
                          t("adminBulkImport.table.semester"),
                          t("adminBulkImport.table.error"),
                        ].map((h, i) => (
                          <TableCell key={i} className="font-black! text-slate-400! uppercase! text-[10px]! tracking-widest! py-5!" sx={{ paddingLeft: i === 0 ? "2rem" : undefined }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.failures.map((failure, i) => (
                        <TableRow key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <TableCell className="pl-8! py-5! font-bold! text-slate-900! dark:text-white!">
                            {failure.row.emri} {failure.row.mbiemri}
                          </TableCell>
                          <TableCell className="text-slate-600! dark:text-slate-300!">{failure.row.email}</TableCell>
                          <TableCell className="text-slate-600! dark:text-slate-300!">{failure.row.role}</TableCell>
                          <TableCell className="text-slate-600! dark:text-slate-300!">{failure.row.department || "—"}</TableCell>
                          <TableCell className="text-slate-600! dark:text-slate-300!">{failure.row.semester ?? "—"}</TableCell>
                          <TableCell className="text-rose-600! dark:text-rose-400! font-semibold!">{failure.errorMessage}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </>
        )}
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

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppPreferences } from "../../context/appPreferencesContext";
import {
  Typography, Container, Box, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, IconButton, CircularProgress,
  Alert, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Rating, Divider, Snackbar,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import RateReviewRounded from "@mui/icons-material/RateReviewRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import Footer from "../../components/ui/Footer";
import {
  getAssistantSubjectStudents, getAssistantStudentReviews,
  createAssistantReview, updateAssistantReview, deleteAssistantReview,
} from "../../services/assistantService";

const today = () => new Date().toISOString().slice(0, 10);
const emptyNote = () => ({ id: null, reviewDate: today(), stars: null, comment: "" });

export default function TeacherSectionRoster() {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { t } = useAppPreferences();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [student, setStudent] = useState(null); // { studentId, studentName }
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [noteForm, setNoteForm] = useState(emptyNote());
  const [finalForm, setFinalForm] = useState({ id: null, stars: null, comment: "" });
  const [saving, setSaving] = useState(false);

  const loadRoster = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await getAssistantSubjectStudents(subjectId));
    } catch (err) {
      setError(err?.response?.data?.message || t("assistant.loadError"));
    } finally {
      setLoading(false);
    }
  }, [subjectId, t]);

  useEffect(() => { loadRoster(); }, [loadRoster]);

  const loadReviews = useCallback(async (studentId) => {
    setReviewsLoading(true);
    try {
      const data = await getAssistantStudentReviews(subjectId, studentId);
      setReviews(data);
      const fin = data.find((r) => r.isFinal);
      setFinalForm(fin ? { id: fin.id, stars: fin.stars, comment: fin.comment || "" } : { id: null, stars: null, comment: "" });
      setNoteForm(emptyNote());
    } finally {
      setReviewsLoading(false);
    }
  }, [subjectId]);

  const openStudent = (row) => {
    setStudent(row);
    setReviews([]);
    loadReviews(row.studentId);
  };
  const closeStudent = () => setStudent(null);

  const dated = useMemo(
    () => reviews.filter((r) => !r.isFinal).sort((a, b) => (a.reviewDate < b.reviewDate ? 1 : -1)),
    [reviews],
  );

  const noteValid = noteForm.stars != null || noteForm.comment.trim() !== "";
  const finalValid = finalForm.stars != null || finalForm.comment.trim() !== "";

  const saveNote = async () => {
    setSaving(true);
    try {
      const payload = { reviewDate: noteForm.reviewDate, stars: noteForm.stars, comment: noteForm.comment.trim() || null };
      if (noteForm.id) await updateAssistantReview(noteForm.id, payload);
      else await createAssistantReview(subjectId, student.studentId, payload);
      setToast(t("assistant.toast.saved"));
      await loadReviews(student.studentId);
      await loadRoster();
    } catch (err) {
      setToast(err?.response?.data?.message || t("assistant.toast.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const saveFinal = async () => {
    setSaving(true);
    try {
      const payload = { reviewDate: null, stars: finalForm.stars, comment: finalForm.comment.trim() || null };
      if (finalForm.id) await updateAssistantReview(finalForm.id, payload);
      else await createAssistantReview(subjectId, student.studentId, payload);
      setToast(t("assistant.toast.saved"));
      await loadReviews(student.studentId);
      await loadRoster();
    } catch (err) {
      setToast(err?.response?.data?.message || t("assistant.toast.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const removeReview = async (id) => {
    if (!window.confirm(t("assistant.confirmDelete"))) return;
    try {
      await deleteAssistantReview(id);
      await loadReviews(student.studentId);
      await loadRoster();
    } catch (err) {
      setToast(err?.response?.data?.message || t("assistant.toast.saveError"));
    }
  };

  return (
    <section className="flex flex-col min-h-screen">
      <Container maxWidth="lg" className="grow py-8 mt-4 sm:mt-8">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/teacher/sections")}
          className="mb-6! normal-case! text-slate-600! dark:text-slate-400!"
        >
          {t("assistant.backToSections")}
        </Button>

        <Box className="mb-8 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
            <GroupsRounded className="text-indigo-600 text-xl!" />
          </div>
          <Typography variant="h4" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
            {t("assistant.rosterTitle")}
          </Typography>
        </Box>

        {error ? <Alert severity="error" className="!mb-4">{error}</Alert> : null}

        <Card
          elevation={0}
          className="rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900/60! dark:border-slate-700/80! overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
        >
          {loading ? (
            <Box className="flex justify-center py-24"><CircularProgress className="text-indigo-500!" /></Box>
          ) : rows.length === 0 ? (
            <Box className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <Typography className="font-semibold! text-slate-500!">{t("assistant.noStudents")}</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead className="bg-slate-50 dark:bg-slate-800/80!">
                  <TableRow>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("assistant.tableStudent")}</TableCell>
                    <TableCell className="font-bold! text-slate-700! dark:text-slate-200!">{t("assistant.tableReviewSummary")}</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.studentId} hover>
                      <TableCell className="font-semibold! text-slate-800! dark:text-slate-100!">{row.studentName}</TableCell>
                      <TableCell className="text-slate-600! dark:text-slate-300! text-sm!">
                        <Box className="flex flex-wrap items-center gap-2">
                          <span>{row.reviewCount} {t("assistant.notesWord")}</span>
                          {row.lastReviewDate ? <span>· {row.lastReviewDate}</span> : null}
                          {row.hasFinal ? (
                            <Chip size="small" label={t("assistant.finalSet")}
                              className="!bg-emerald-100 !text-emerald-800 dark:!bg-emerald-950/60 dark:!text-emerald-300" />
                          ) : null}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" startIcon={<RateReviewRounded />} onClick={() => openStudent(row)}
                          className="normal-case! font-bold!">
                          {t("assistant.reviewBtn")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Container>

      <Dialog open={Boolean(student)} onClose={closeStudent} maxWidth="sm" fullWidth
        PaperProps={{ className: "rounded-2xl!" }}>
        <DialogTitle className="font-bold!">
          {t("assistant.dialogTitle")}{student ? ` — ${student.studentName}` : ""}
        </DialogTitle>
        <DialogContent dividers>
          {reviewsLoading ? (
            <Box className="flex justify-center py-8"><CircularProgress size={24} /></Box>
          ) : (
            <Box className="flex flex-col gap-6">
              {/* Final review */}
              <Box>
                <Typography variant="subtitle2" className="font-bold! mb-2!">{t("assistant.finalReview")}</Typography>
                <Box className="flex flex-col gap-2">
                  <Rating value={finalForm.stars ?? null} onChange={(_, v) => setFinalForm((f) => ({ ...f, stars: v }))} />
                  <TextField
                    size="small" fullWidth multiline minRows={2}
                    placeholder={t("assistant.commentPlaceholder")}
                    value={finalForm.comment}
                    onChange={(e) => setFinalForm((f) => ({ ...f, comment: e.target.value }))}
                  />
                  <Box>
                    <Button size="small" variant="contained" disabled={!finalValid || saving} onClick={saveFinal}
                      className="normal-case! rounded-xl!">
                      {t("assistant.saveFinal")}
                    </Button>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Add / edit a dated note */}
              <Box>
                <Typography variant="subtitle2" className="font-bold! mb-2!">
                  {noteForm.id ? t("assistant.editNote") : t("assistant.addNote")}
                </Typography>
                <Box className="flex flex-col gap-2">
                  <TextField
                    size="small" type="date" label={t("assistant.dateLabel")}
                    value={noteForm.reviewDate}
                    onChange={(e) => setNoteForm((f) => ({ ...f, reviewDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    className="w-48"
                  />
                  <Rating value={noteForm.stars ?? null} onChange={(_, v) => setNoteForm((f) => ({ ...f, stars: v }))} />
                  <TextField
                    size="small" fullWidth multiline minRows={2}
                    placeholder={t("assistant.commentPlaceholder")}
                    value={noteForm.comment}
                    onChange={(e) => setNoteForm((f) => ({ ...f, comment: e.target.value }))}
                  />
                  <Box className="flex gap-2">
                    <Button size="small" variant="contained" disabled={!noteValid || saving} onClick={saveNote}
                      className="normal-case! rounded-xl!">
                      {noteForm.id ? t("assistant.saveNote") : t("assistant.addNoteBtn")}
                    </Button>
                    {noteForm.id ? (
                      <Button size="small" onClick={() => setNoteForm(emptyNote())} className="normal-case!">
                        {t("assistant.cancelEdit")}
                      </Button>
                    ) : null}
                  </Box>
                </Box>
              </Box>

              {/* Log */}
              <Box>
                <Typography variant="subtitle2" className="font-bold! mb-2!">{t("assistant.log")}</Typography>
                {dated.length === 0 ? (
                  <Typography variant="body2" className="text-slate-500!">{t("assistant.noNotes")}</Typography>
                ) : (
                  <Box className="flex flex-col gap-2">
                    {dated.map((r) => (
                      <Box key={r.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                        <Box className="flex items-center justify-between gap-2">
                          <Box className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{r.reviewDate}</span>
                            {r.stars != null ? <Rating value={r.stars} readOnly size="small" /> : null}
                          </Box>
                          <Box>
                            <IconButton size="small" onClick={() => setNoteForm({ id: r.id, reviewDate: r.reviewDate, stars: r.stars, comment: r.comment || "" })}>
                              <EditRounded fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => removeReview(r.id)}>
                              <DeleteRounded fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        {r.comment ? <Typography variant="body2" className="mt-1! text-slate-600! dark:text-slate-300!">{r.comment}</Typography> : null}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStudent} className="normal-case!">{t("assistant.close")}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast("")} message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }} />

      <Footer />
    </section>
  );
}

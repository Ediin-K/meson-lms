import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Rating,
  CircularProgress,
} from "@mui/material";
import GradeOutlined from "@mui/icons-material/GradeOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import { useAppPreferences } from "../../context/appPreferencesContext";
import { getAssistantReviewsForStudent } from "../../services/assistantService";

const GRADE_OPTIONS = [5, 6, 7, 8, 9, 10];

/** Read-only: an assistant's dated notes + final review for this student, shown while grading. */
function AssistantReviewPanel({ subjectId, studentId }) {
  const { t } = useAppPreferences();
  const [open, setOpen] = useState(false);

  if (!subjectId || !studentId) return null;

  return (
    <Box className="rounded-lg border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-bold text-slate-700 dark:text-slate-200"
      >
        <RateReviewOutlined sx={{ fontSize: 18 }} />
        {t("assistant.viewAssistantReview")}
        <span className="ml-auto text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <AssistantReviewList
          key={`${subjectId}-${studentId}`}
          subjectId={subjectId}
          studentId={studentId}
        />
      )}
    </Box>
  );
}

/** Mounts fresh (keyed) per student, so the fetch runs once with only async state updates. */
function AssistantReviewList({ subjectId, studentId }) {
  const { t } = useAppPreferences();
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    getAssistantReviewsForStudent(subjectId, studentId)
      .then((d) => { if (active) setData(d); })
      .catch(() => { if (active) setData({ dated: [], finalReview: null }); });
    return () => { active = false; };
  }, [subjectId, studentId]);

  const loading = data === null;
  const rows = data?.dated || [];
  const fin = data?.finalReview || null;
  const empty = !loading && rows.length === 0 && !fin;

  return (
        <Box className="border-t border-slate-200 px-3 py-3 dark:border-slate-700">
          {loading ? (
            <Box className="flex justify-center py-3"><CircularProgress size={20} /></Box>
          ) : empty ? (
            <Typography variant="body2" className="!text-slate-500">{t("assistant.teacherPanelEmpty")}</Typography>
          ) : (
            <Box className="flex flex-col gap-2">
              {fin ? (
                <Box className="rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/40">
                  <Box className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                      {t("assistant.teacherPanelFinal")}
                    </span>
                    {fin.stars != null ? <Rating value={fin.stars} readOnly size="small" /> : null}
                    <span className="ml-auto text-xs text-slate-500">{fin.assistantName}</span>
                  </Box>
                  {fin.comment ? <Typography variant="body2" className="!mt-1">{fin.comment}</Typography> : null}
                </Box>
              ) : null}
              {rows.map((r) => (
                <Box key={r.id} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <Box className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{r.reviewDate}</span>
                    {r.stars != null ? <Rating value={r.stars} readOnly size="small" /> : null}
                    <span className="ml-auto text-xs text-slate-500">{r.assistantName}</span>
                  </Box>
                  {r.comment ? <Typography variant="body2" className="!mt-1 !text-slate-600 dark:!text-slate-300">{r.comment}</Typography> : null}
                </Box>
              ))}
            </Box>
          )}
    </Box>
  );
}

function buildForm(initialData, fixedSubjectId) {
  if (initialData) {
    return {
      studentId: initialData.studentId || "",
      subjectId: initialData.subjectId || fixedSubjectId || "",
      grade: initialData.grade ?? "",
      comment: initialData.comment || "",
    };
  }
  return { studentId: "", subjectId: fixedSubjectId || "", grade: "", comment: "" };
}

function gradeBtnClass(selected, value) {
  const base = "flex h-11 w-11 items-center justify-center rounded-lg border-2 text-base font-bold transition-all";
  if (selected) {
    if (value >= 9) return `${base} border-emerald-500 bg-emerald-500 text-white shadow-md`;
    if (value >= 7) return `${base} border-sky-500 bg-sky-500 text-white shadow-md`;
    if (value >= 6) return `${base} border-amber-500 bg-amber-500 text-white shadow-md`;
    return `${base} border-rose-500 bg-rose-500 text-white shadow-md`;
  }
  return `${base} border-slate-200 bg-white text-slate-700 hover:border-sky-400 hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200`;
}

function GradeFormFields({
  onClose,
  onSubmit,
  initialData = null,
  students = [],
  subjects = [],
  fixedSubjectId = null,
  fixedSubjectTitle = "",
  submitting = false,
}) {
  const [form, setForm] = useState(() => buildForm(initialData, fixedSubjectId));
  const isEdit = Boolean(initialData?.id);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      studentId: Number(form.studentId),
      subjectId: Number(form.subjectId),
      grade: Number(form.grade),
      comment: form.comment.trim() || null,
    });
  };

  const isValid =
    form.studentId &&
    form.subjectId &&
    form.grade &&
    GRADE_OPTIONS.includes(Number(form.grade));

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle className="!border-b !border-slate-200 !pb-4 dark:!border-slate-700">
        <Box className="flex items-center gap-2">
          <GradeOutlined className="text-[#1e3a5f] dark:text-sky-400" />
          <Typography variant="h6" className="!font-bold dark:!text-white">
            {isEdit ? "Ndrysho notën" : "Vendos notë të re"}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent className="!pt-5">
        {fixedSubjectId && fixedSubjectTitle && (
          <Box className="mb-4 rounded-lg bg-slate-100 px-4 py-3 dark:bg-slate-800">
            <Typography variant="caption" className="!font-semibold !uppercase !tracking-wide !text-slate-500">
              Lënda
            </Typography>
            <Typography className="!mt-0.5 !font-semibold !text-[#1e3a5f] dark:!text-white">
              {fixedSubjectTitle}
            </Typography>
          </Box>
        )}

        <Box className="flex flex-col gap-4">
          {!fixedSubjectId && (
            <FormControl fullWidth required size="small">
              <InputLabel>Lënda</InputLabel>
              <Select
                value={form.subjectId}
                label="Lënda"
                onChange={handleChange("subjectId")}
                disabled={isEdit}
              >
                {subjects.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.titulli}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth required size="small">
            <InputLabel>Studenti</InputLabel>
            <Select
              value={form.studentId}
              label="Studenti"
              onChange={handleChange("studentId")}
              disabled={isEdit}
            >
              {students.map((s) => (
                <MenuItem key={s.userId || s.id} value={s.userId || s.id}>
                  {s.userEmri || s.emri} {s.userMbiemri || s.mbiemri}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider />

          <Box>
            <Typography variant="subtitle2" className="!mb-3 !font-bold !text-slate-700 dark:!text-slate-300">
              Zgjidhni notën (5 – 10)
            </Typography>
            <Box className="flex flex-wrap gap-2">
              {GRADE_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, grade: g }))}
                  className={gradeBtnClass(Number(form.grade) === g, g)}
                >
                  {g}
                </button>
              ))}
            </Box>
          </Box>

          <TextField
            label="Koment / Feedback"
            value={form.comment}
            onChange={handleChange("comment")}
            multiline
            rows={3}
            fullWidth
            size="small"
            placeholder="Shkruani vlerësimin ose komentin për studentin..."
          />

          <AssistantReviewPanel
            subjectId={form.subjectId || fixedSubjectId}
            studentId={form.studentId}
          />
        </Box>
      </DialogContent>

      <DialogActions className="!border-t !border-slate-200 !px-6 !py-4 dark:!border-slate-700">
        <Button onClick={onClose} className="!rounded-lg !normal-case !text-slate-600">
          Anulo
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!isValid || submitting}
          className="!rounded-lg !normal-case !bg-[#2563eb] !px-6 hover:!bg-[#1d4ed8]"
        >
          {submitting ? "Duke ruajtur..." : isEdit ? "Ruaj ndryshimet" : "Ruaj notën"}
        </Button>
      </DialogActions>
    </form>
  );
}

export default function GradeFormDialog({
  open,
  onClose,
  onSubmit,
  initialData = null,
  students = [],
  subjects = [],
  fixedSubjectId = null,
  fixedSubjectTitle = "",
  submitting = false,
}) {
  const formKey = `${initialData?.id ?? "new"}-${fixedSubjectId ?? ""}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ className: "rounded-xl" }}
    >
      {open && (
        <GradeFormFields
          key={formKey}
          onClose={onClose}
          onSubmit={onSubmit}
          initialData={initialData}
          students={students}
          subjects={subjects}
          fixedSubjectId={fixedSubjectId}
          fixedSubjectTitle={fixedSubjectTitle}
          submitting={submitting}
        />
      )}
    </Dialog>
  );
}

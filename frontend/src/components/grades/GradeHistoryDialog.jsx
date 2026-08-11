import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAppPreferences } from "../../context/appPreferencesContext";
import { getGradeHistory } from "../../services/gradeAuditService";

const ACTION_STYLE = {
  CREATED: "!bg-emerald-100 !text-emerald-800 dark:!bg-emerald-950/60 dark:!text-emerald-300",
  UPDATED: "!bg-sky-100 !text-sky-800 dark:!bg-sky-950/60 dark:!text-sky-300",
  DELETED: "!bg-rose-100 !text-rose-800 dark:!bg-rose-950/60 dark:!text-rose-300",
};

const ACTION_LABEL_KEY = {
  CREATED: "gradeHistory.actionCreated",
  UPDATED: "gradeHistory.actionUpdated",
  DELETED: "gradeHistory.actionDeleted",
};

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function GradeHistoryDialog({ open, onClose, gradeId }) {
  const { t } = useAppPreferences();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !gradeId) return;
    setLoading(true);
    setError("");
    getGradeHistory(gradeId)
      .then(setEntries)
      .catch((err) => setError(err?.response?.data?.message || t("gradeHistory.loadError")))
      .finally(() => setLoading(false));
  }, [open, gradeId, t]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: "rounded-xl" }}>
      <DialogTitle className="!font-bold">{t("gradeHistory.title")}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box className="flex justify-center py-8"><CircularProgress size={28} /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : entries.length === 0 ? (
          <Typography className="!py-4 !text-slate-500 dark:!text-slate-400">
            {t("gradeHistory.noEntries")}
          </Typography>
        ) : (
          <Box className="flex flex-col gap-3 py-2">
            {entries.map((entry) => (
              <Box
                key={entry.id}
                className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
              >
                <Box className="flex flex-wrap items-center justify-between gap-2">
                  <Chip size="small" label={t(ACTION_LABEL_KEY[entry.action])} className={ACTION_STYLE[entry.action]} />
                  <Typography variant="caption" className="!text-slate-500 dark:!text-slate-400">
                    {formatDateTime(entry.performedAt)}
                  </Typography>
                </Box>
                <Typography variant="body2" className="!mt-2 !text-slate-700 dark:!text-slate-300">
                  {t("gradeHistory.by")} <strong>{entry.performedByName}</strong>
                </Typography>
                {entry.action === "UPDATED" && (
                  <Typography variant="body2" className="!mt-1 !font-semibold">
                    {entry.previousGrade} → {entry.newGrade}
                  </Typography>
                )}
                {entry.action === "CREATED" && (
                  <Typography variant="body2" className="!mt-1 !font-semibold">
                    {t("gradeHistory.grade")}: {entry.newGrade}
                  </Typography>
                )}
                {entry.action === "DELETED" && (
                  <Typography variant="body2" className="!mt-1 !font-semibold">
                    {t("gradeHistory.grade")}: {entry.previousGrade}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions className="!px-6 !pb-4">
        <Button onClick={onClose} className="!rounded-lg !normal-case">{t("gradeHistory.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}

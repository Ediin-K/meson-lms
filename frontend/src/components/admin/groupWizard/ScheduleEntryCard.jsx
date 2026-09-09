import { Box, IconButton, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";
import TruncatedSelect from "./TruncatedSelect";
import RoomInput from "./RoomInput";
import { computeScheduleEndTime } from "../../../utils/scheduleConflict";
import { getGroupsTheme, getWizardFieldSx, wizardFieldClass } from "./wizardUi";

export default function ScheduleEntryCard({
  row,
  index,
  isDark,
  subjectOptions,
  staffForSubject,
  onChange,
  onRemove,
  canRemove,
  rowError,
}) {
  const t = getGroupsTheme(isDark);

  const isExercise = row.sessionType === "EXERCISE";
  const hasAssistant = Boolean(
    staffForSubject?.assistantLabel && staffForSubject.assistantLabel !== "—",
  );
  const teacherLabel = isExercise
    ? hasAssistant
      ? staffForSubject.assistantLabel
      : staffForSubject?.professorLabel
    : staffForSubject?.professorLabel;

  const gridFields = (
    <>
      <Box className="min-w-0 lg:col-span-2">
        <TruncatedSelect
          label="Lenda"
          value={row.subjectId}
          onChange={(e) => onChange(index, "subjectId", e.target.value)}
          options={subjectOptions}
          emptyOption="Zgjidh lenden"
          isDark={isDark}
          maxLabelLen={36}
        />
      </Box>
      <Box className="min-w-0 lg:col-span-2">
        <ToggleButtonGroup
          exclusive
          size="small"
          value={row.sessionType || "LECTURE"}
          onChange={(_, val) => val && onChange(index, "sessionType", val)}
          fullWidth
          sx={{
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontWeight: 700,
              color: t.textMuted,
              borderColor: t.border,
            },
            "& .Mui-selected": {
              color: `${t.text} !important`,
              bgcolor: `${t.hover} !important`,
              borderColor: `${t.accent} !important`,
            },
          }}
        >
          <ToggleButton value="LECTURE">Ligjerate</ToggleButton>
          <ToggleButton value="EXERCISE">Ushtrime</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box className="min-w-0">
        <TextField
          size="small"
          label="Fillimi"
          type="time"
          value={row.startTime}
          onChange={(e) => {
            const v = e.target.value;
            onChange(index, "startTime", v);
            if (!row.endTime) onChange(index, "endTime", computeScheduleEndTime(v));
          }}
          fullWidth
          className={wizardFieldClass()}
          sx={getWizardFieldSx(isDark)}
        />
      </Box>
      <Box className="min-w-0">
        <TextField
          size="small"
          label="Mbarimi"
          type="time"
          value={row.endTime || computeScheduleEndTime(row.startTime)}
          onChange={(e) => onChange(index, "endTime", e.target.value)}
          fullWidth
          className={wizardFieldClass()}
          sx={getWizardFieldSx(isDark)}
        />
      </Box>
      <Box className="min-w-0 lg:col-span-2">
        <RoomInput value={row.room} onChange={(v) => onChange(index, "room", v)} isDark={isDark} />
      </Box>
    </>
  );

  return (
    <Box
      className="group rounded-xl border p-3 transition-all duration-200"
      sx={{
        borderColor: rowError ? t.danger : t.border,
        bgcolor: t.card,
        color: t.text,
        "&:hover": { borderColor: t.accent },
      }}
    >
      <Box className="mb-2 flex items-center justify-between gap-2">
        <Box className="flex items-center gap-1.5 min-w-0">
          <PersonRounded sx={{ fontSize: 16, color: t.accent }} />
          <Typography variant="caption" sx={{ color: t.text, fontWeight: 700 }} noWrap>
            {row.subjectId
              ? `${isExercise ? "Ushtrime" : "Ligjerate"} · ${teacherLabel || "—"}`
              : "Zgjidh lenden"}
          </Typography>
        </Box>
        <IconButton
          size="small"
          color="error"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          aria-label="Fshi orën"
        >
          <DeleteRounded fontSize="small" />
        </IconButton>
      </Box>

      <Box className="hidden lg:block overflow-x-auto pb-1 -mx-1 px-1">
        <Box
          className="grid gap-2 min-w-[640px]"
          style={{
            gridTemplateColumns:
              "minmax(160px,1.6fr) minmax(150px,1.2fr) minmax(95px,0.7fr) minmax(95px,0.7fr) minmax(130px,1fr)",
          }}
        >
          {gridFields}
        </Box>
      </Box>

      <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:hidden">{gridFields}</Box>

      {rowError && (
        <Typography variant="caption" sx={{ mt: 1, display: "block", color: t.danger, fontWeight: 700 }}>
          {rowError}
        </Typography>
      )}
      {row.subjectId && !staffForSubject?.professorId && (
        <Typography variant="caption" sx={{ mt: 1, display: "block", color: t.warning }}>
          Kjo lende nuk ka staf ne hapin e stafit — shtojeni atje fillimisht.
        </Typography>
      )}
      {row.subjectId && isExercise && staffForSubject?.professorId && !hasAssistant && (
        <Typography variant="caption" sx={{ mt: 1, display: "block", color: t.warning }}>
          Kjo lende nuk ka asistent — ushtrimet do t'i mbajë profesori.
        </Typography>
      )}
    </Box>
  );
}

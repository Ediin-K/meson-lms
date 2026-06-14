import { useNavigate } from 'react-router-dom'
import { useAppPreferences } from '../../../context/appPreferencesContext.js'
import { formatDate } from '../../../lib/dateFormat.js'
import { Box, Chip, Typography } from '@mui/material'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'

export default function ProfileAssignmentsSection({ submissions, t }) {
    const navigate = useNavigate()
    const { locale } = useAppPreferences()

    return (
        <Box>
            <Typography variant="h6" className="!font-extrabold !text-slate-900 dark:!text-white !mb-4 flex items-center gap-2">
                <AssignmentRounded className="text-sky-600" fontSize="small" />
                {t?.('profile.assignments') ?? 'Detyrat'}
            </Typography>

            {!submissions || submissions.length === 0 ? (
                <Typography variant="body2" className="!text-slate-500">
                    {t?.('profile.noAssignments') ?? 'Nuk keni dorëzime ende.'}
                </Typography>
            ) : (
                <div className="flex flex-col gap-3">
                    {submissions.map(sub => {
                        const isLate = new Date(sub.submittedAt) > new Date(sub.deadline)
                        return (
                            <Box
                                key={sub.id}
                                className="p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-sky-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                onClick={() => navigate(`/assignment/${sub.assignmentId}`)}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white truncate">
                                            {sub.assignmentTitle}
                                        </Typography>
                                        <Typography variant="caption" className="!text-slate-500 !block">
                                            {sub.lessonTitle}
                                        </Typography>
                                        <Typography variant="caption" className="!text-slate-400 !block !mt-0.5">
                                            Dorëzuar: {formatDate(sub.submittedAt, locale)}
                                        </Typography>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <Chip
                                            icon={<CheckCircleRounded style={{ fontSize: 14 }} />}
                                            label="Dorëzuar"
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                            className="!text-xs"
                                        />
                                        {isLate && (
                                            <Chip label="Me vonesë" size="small" color="warning" className="!text-xs" />
                                        )}
                                    </div>
                                </div>
                            </Box>
                        )
                    })}
                </div>
            )}
        </Box>
    )
}

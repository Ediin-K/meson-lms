import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Chip, CircularProgress, Typography } from '@mui/material'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import UploadFileRounded from '@mui/icons-material/UploadFileRounded'
import assignmentService from '../../services/assignmentService'

export default function LessonAssignmentCard({ lessonId }) {
    const navigate = useNavigate()
    const [assignment, setAssignment] = useState(null)
    const [submitted, setSubmitted]   = useState(false)
    const [loading, setLoading]       = useState(true)

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const res = await assignmentService.getByLesson(lessonId)
                if (!mounted) return
                // 204 → no assignment yet
                if (res.status === 204 || !res.data) { setLoading(false); return }
                setAssignment(res.data)

                try {
                    const subRes = await assignmentService.getMySubmission(res.data.id)
                    if (mounted && subRes.data) setSubmitted(true)
                } catch { /* 404 = not submitted yet */ }
            } catch { /* no assignment */ }
            finally { if (mounted) setLoading(false) }
        })()
        return () => { mounted = false }
    }, [lessonId])

    if (loading) return null
    if (!assignment) return null

    const isOpen = assignment.isOpen
    const deadline = new Date(assignment.deadline).toLocaleString('sq-AL', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })

    return (
        <Box
            className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <AssignmentRounded className="text-emerald-600" fontSize="small" />
                    <div>
                        <Typography variant="body2" className="!font-semibold dark:!text-white">
                            {assignment.title}
                        </Typography>
                        <Typography variant="caption" className="text-slate-500">
                            ⏰ Afati: {deadline}
                        </Typography>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {submitted ? (
                        <Chip
                            icon={<CheckCircleRounded style={{ fontSize: 14 }} />}
                            label="Dorëzuar"
                            size="small"
                            color="success"
                        />
                    ) : !isOpen ? (
                        <Chip label="Mbyllur" size="small" color="error" variant="outlined" />
                    ) : null}

                    <Button
                        size="small"
                        variant="contained"
                        startIcon={submitted ? <CheckCircleRounded /> : <UploadFileRounded />}
                        disabled={!isOpen && !submitted}
                        onClick={() => navigate(`/assignment/${assignment.id}`)}
                        className={`!normal-case ${submitted ? '!bg-emerald-600 hover:!bg-emerald-700' : '!bg-sky-600 hover:!bg-sky-700'}`}
                    >
                        {submitted ? 'Shiko dorëzimin' : isOpen ? 'Dorëzo detyrën' : 'Afati kaloi'}
                    </Button>
                </div>
            </div>
        </Box>
    )
}

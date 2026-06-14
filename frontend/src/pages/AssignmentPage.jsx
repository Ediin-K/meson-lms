import { useEffect, useState } from 'react'
import { formatDateTime } from '../lib/dateFormat.js'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Typography, Alert,
} from '@mui/material'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'
import AttachFileRounded from '@mui/icons-material/AttachFileRounded'
import FileDownloadRounded from '@mui/icons-material/FileDownloadRounded'
import UploadFileRounded from '@mui/icons-material/UploadFileRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import assignmentService from '../services/assignmentService'
import { apiMessage } from '../lib/apiError.js'
import { useAppPreferences } from '../context/appPreferencesContext'

function DeadlineChip({ deadline, isOpen, deadlinePrefix, locale }) {
    const label = formatDateTime(deadline, locale)
    return (
        <Chip
            label={`${deadlinePrefix}${label}`}
            size="small"
            color={isOpen ? 'success' : 'error'}
            variant="outlined"
            className="!font-semibold"
        />
    )
}

export default function AssignmentPage() {
    const { assignmentId } = useParams()
    const navigate = useNavigate()
    const { t, locale } = useAppPreferences()

    const [assignment, setAssignment]   = useState(null)
    const [submission, setSubmission]   = useState(null)
    const [loading, setLoading]         = useState(true)
    const [uploading, setUploading]     = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [error, setError]             = useState('')
    const [success, setSuccess]         = useState('')
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const [aRes, sRes] = await Promise.allSettled([
                    assignmentService.getById(assignmentId),
                    assignmentService.getMySubmission(assignmentId),
                ])
                if (aRes.status === 'fulfilled') setAssignment(aRes.value.data)
                if (sRes.status === 'fulfilled') setSubmission(sRes.value.data)
            } catch {
                setError(t('assignmentPage.errorNotFound'))
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [assignmentId])

    const handleDownloadAttachment = async () => {
        setDownloading(true)
        try {
            const res = await assignmentService.downloadAttachment(assignmentId)
            const url = URL.createObjectURL(res.data)
            const a = document.createElement('a')
            a.href = url
            a.download = assignment.attachmentName || 'attachment'
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            setError(apiMessage(err, t('assignmentPage.errorDownload')))
        } finally {
            setDownloading(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedFile) return
        setUploading(true)
        setError('')
        try {
            const res = await assignmentService.submit(assignmentId, selectedFile)
            setSubmission(res.data)
            setSelectedFile(null)
            setSuccess(t('assignmentPage.successSubmit'))
        } catch (err) {
            setError(apiMessage(err, t('assignmentPage.errorSubmit')))
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <Box className="flex justify-center items-center py-24">
                <CircularProgress className="!text-sky-500" />
            </Box>
        )
    }

    if (!assignment) {
        return (
            <Container maxWidth="lg" sx={{ mt: 6 }}>
                <Typography className="!text-slate-800 dark:!text-white">{t('assignmentPage.notFound')}</Typography>
                <Button startIcon={<ArrowBackRounded />} onClick={() => navigate(-1)} className="!mt-4 !normal-case">{t('assignmentPage.backBtn')}</Button>
            </Container>
        )
    }

    const isOpen = assignment.isOpen

    return (
        <Container maxWidth="md" className="py-8 mt-4 sm:mt-8">
            <Button
                startIcon={<ArrowBackRounded />}
                onClick={() => navigate(-1)}
                className="!mb-6 !normal-case !text-slate-600 dark:!text-slate-400"
            >
                {t('assignmentPage.backToLesson')}
            </Button>

            {}
            <Card elevation={0} className="rounded-2xl border border-slate-200 dark:!bg-slate-900/50 dark:!border-slate-700 !mb-6">
                <CardContent className="!p-6">
                    <div className="flex items-start gap-3 mb-4">
                        <AssignmentRounded className="text-sky-600 !mt-1" />
                        <div className="flex-1">
                            <Typography variant="h5" className="!font-extrabold !text-slate-900 dark:!text-white !mb-1">
                                {assignment.title}
                            </Typography>
                            <Typography variant="caption" className="!text-slate-500">
                                {assignment.lessonTitle}
                            </Typography>
                        </div>
                        <DeadlineChip deadline={assignment.deadline} isOpen={isOpen} deadlinePrefix={t('assignmentPage.deadlinePrefix')} locale={locale} />
                    </div>

                    {!isOpen && (
                        <Alert severity={submission ? 'error' : 'warning'} className="!mb-4 !rounded-xl">
                            {submission ? t('assignmentPage.deadlinePassed') : t('assignmentPage.lateWarning')}
                        </Alert>
                    )}

                    {assignment.description && (
                        <Typography variant="body1" className="!text-slate-700 dark:!text-slate-300 !leading-relaxed whitespace-pre-wrap !mb-4">
                            {assignment.description}
                        </Typography>
                    )}

                    {}
                    {assignment.hasAttachment && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
                            <AttachFileRounded className="text-sky-600" fontSize="small" />
                            <Typography variant="body2" className="!flex-1 !text-slate-700 dark:!text-slate-300 !font-medium truncate">
                                {assignment.attachmentName || t('assignmentPage.attachmentDefault')}
                            </Typography>
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<FileDownloadRounded />}
                                onClick={handleDownloadAttachment}
                                disabled={downloading}
                                className="!rounded-lg !normal-case !bg-sky-600 hover:!bg-sky-700 !shrink-0"
                            >
                                {downloading ? <CircularProgress size={16} className="!text-white" /> : t('assignmentPage.downloadBtn')}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {}
            <Card elevation={0} className="rounded-2xl border border-slate-200 dark:!bg-slate-900/50 dark:!border-slate-700">
                <CardContent className="!p-6">
                    <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white !mb-4">
                        {t('assignmentPage.submissionTitle')}
                    </Typography>

                    {success && <Alert severity="success" className="!mb-4 !rounded-xl">{success}</Alert>}
                    {error && <Alert severity="error" className="!mb-4 !rounded-xl">{error}</Alert>}

                    {submission && (
                        <div className="flex flex-col gap-3 mb-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircleRounded className="text-emerald-600" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Typography variant="body2" className="!font-semibold !text-emerald-800 dark:!text-emerald-300">
                                            {t('assignmentPage.submittedSuccess')}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={
                                                submission.status === 'GRADED' ? t('assignmentPage.gradedChip')
                                                : submission.late ? t('assignmentPage.lateChip')
                                                : t('assignmentPage.onTimeChip')
                                            }
                                            color={
                                                submission.status === 'GRADED' ? 'info'
                                                : submission.late ? 'warning'
                                                : 'success'
                                            }
                                            className="!font-semibold"
                                        />
                                    </div>
                                    <Typography variant="caption" className="!text-slate-500 truncate !block">
                                        {submission.fileName} · {formatDateTime(submission.submittedAt, locale)}
                                    </Typography>
                                    {submission.firstSubmittedAt && submission.firstSubmittedAt !== submission.submittedAt && (
                                        <Typography variant="caption" className="!text-slate-400 !block">
                                            {t('assignmentPage.firstSubmittedLabel')}{formatDateTime(submission.firstSubmittedAt, locale)}
                                        </Typography>
                                    )}
                                </div>
                            </div>

                            {(submission.grade != null || submission.feedback) && (
                                <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
                                    {submission.grade != null && (
                                        <Typography variant="body2" className="!font-bold !text-sky-800 dark:!text-sky-300">
                                            {t('assignmentPage.gradeLabel')}: {submission.grade}
                                        </Typography>
                                    )}
                                    {submission.feedback && (
                                        <Typography variant="body2" className="!text-slate-700 dark:!text-slate-300 whitespace-pre-wrap !mt-1">
                                            <span className="font-semibold">{t('assignmentPage.feedbackLabel')}:</span> {submission.feedback}
                                        </Typography>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {(!submission || (isOpen && submission.status !== 'GRADED')) ? (
                        <div className="flex flex-col gap-4">
                            <label className="block">
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-600 cursor-pointer transition-colors">
                                    <UploadFileRounded className="text-sky-600" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400 flex-1 truncate">
                                        {selectedFile ? selectedFile.name : t('assignmentPage.chooseFile')}
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    className="sr-only"
                                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                                />
                            </label>
                            <Button
                                variant="contained"
                                disabled={!selectedFile || uploading}
                                onClick={handleSubmit}
                                className="!rounded-xl !normal-case !bg-sky-600 hover:!bg-sky-700 !py-2"
                            >
                                {uploading
                                    ? <CircularProgress size={20} className="!text-white" />
                                    : submission ? t('assignmentPage.resubmitBtn') : t('assignmentPage.submitBtn')}
                            </Button>
                            {submission && isOpen && (
                                <Typography variant="caption" className="!text-slate-400">
                                    {t('assignmentPage.resubmitHint')}
                                </Typography>
                            )}
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </Container>
    )
}

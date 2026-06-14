import { useCallback, useEffect, useState } from 'react'
import { formatDateTime } from '../../lib/dateFormat.js'
import {
    Alert, Box, Button, Card, CardContent, Checkbox, Chip, CircularProgress,
    Container, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, IconButton, InputLabel, MenuItem, Select,
    TextField, Tooltip, Typography,
} from '@mui/material'
import AssignmentRounded    from '@mui/icons-material/AssignmentRounded'
import AddRounded           from '@mui/icons-material/AddRounded'
import EditRounded          from '@mui/icons-material/EditRounded'
import DeleteRounded        from '@mui/icons-material/DeleteRounded'
import PeopleRounded        from '@mui/icons-material/PeopleRounded'
import CloseRounded         from '@mui/icons-material/CloseRounded'
import AttachFileRounded    from '@mui/icons-material/AttachFileRounded'
import FileDownloadRounded  from '@mui/icons-material/FileDownloadRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import UploadFileRounded    from '@mui/icons-material/UploadFileRounded'
import VisibilityRounded    from '@mui/icons-material/VisibilityRounded'
import RateReviewRounded    from '@mui/icons-material/RateReviewRounded'
import assignmentService    from '../../services/assignmentService'
import { apiMessage }       from '../../lib/apiError.js'
import Footer               from '../../components/ui/Footer'
import { useAppPreferences } from '../../context/appPreferencesContext'

function fmtDeadline(dl, locale) {
    return formatDateTime(dl, locale)
}

const EMPTY_FORM = { title: '', description: '', deadline: '', lessonId: '' }

export default function TeacherAssignments() {
    const { t, locale } = useAppPreferences()

    const [assignments, setAssignments]   = useState([])
    const [lessons, setLessons]           = useState([])
    const [loading, setLoading]           = useState(true)
    const [error, setError]               = useState('')

    const [formOpen, setFormOpen]         = useState(false)
    const [editing, setEditing]           = useState(null)
    const [form, setForm]                 = useState(EMPTY_FORM)
    const [saving, setSaving]             = useState(false)

    const [attachOpen, setAttachOpen]     = useState(false)
    const [attachTarget, setAttachTarget] = useState(null)
    const [attachFile, setAttachFile]     = useState(null)
    const [attachSaving, setAttachSaving] = useState(false)

    const [subsOpen, setSubsOpen]         = useState(false)
    const [subsTarget, setSubsTarget]     = useState(null)
    const [submissions, setSubmissions]   = useState([])
    const [subsLoading, setSubsLoading]   = useState(false)

    const [deleteId, setDeleteId]         = useState(null)

    const [gradeTarget, setGradeTarget]   = useState(null)
    const [bulkOpen, setBulkOpen]         = useState(false)
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [selectedIds, setSelectedIds]   = useState([])
    const [zipLoading, setZipLoading]     = useState(false)
    const [gradeForm, setGradeForm]       = useState({ grade: '', feedback: '' })
    const [gradeSaving, setGradeSaving]   = useState(false)

    function submissionStatusChip(sub) {
        const map = {
            NOT_SUBMITTED: { label: t('teacherAssignments.statusNotSubmitted'), color: 'default' },
            SUBMITTED:     { label: t('teacherAssignments.statusSubmitted'),    color: 'success' },
            LATE:          { label: t('teacherAssignments.statusLate'),         color: 'warning' },
            GRADED:        { label: t('teacherAssignments.statusGraded'),       color: 'info' },
        }
        const s = map[sub.status] || map.SUBMITTED
        return <Chip label={s.label} size="small" color={s.color} className="!font-semibold" />
    }

    function openStatusChip(isOpen) {
        return (
            <Chip
                label={isOpen ? t('teacherAssignments.statusOpen') : t('teacherAssignments.statusClosed')}
                size="small"
                color={isOpen ? 'success' : 'default'}
                className="!font-semibold"
            />
        )
    }

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [aRes, lRes] = await Promise.all([
                assignmentService.getAll(),
                assignmentService.getLessonsForAssignment(),
            ])
            setAssignments(aRes.data)
            setLessons(lRes.data)
        } catch (err) {
            setError(apiMessage(err, t('teacherAssignments.errorLoading')))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const openCreate = () => {
        setEditing(null)
        setForm(EMPTY_FORM)
        setFormOpen(true)
    }

    const openEdit = (a) => {
        setEditing(a)
        setForm({
            title: a.title,
            description: a.description || '',
            deadline: a.deadline ? a.deadline.slice(0, 16) : '',
            lessonId: a.lessonId,
        })
        setFormOpen(true)
    }

    const handleSave = async () => {
        if (!form.title.trim() || !form.deadline || !form.lessonId) return
        setSaving(true)
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                deadline: form.deadline + ':00',
                lessonId: form.lessonId,
            }
            if (editing) {
                await assignmentService.update(editing.id, payload)
            } else {
                await assignmentService.create(payload)
            }
            setFormOpen(false)
            load()
        } catch (err) {
            setError(err.response?.data?.message || t('teacherAssignments.errorSave'))
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async () => {
        try {
            await assignmentService.remove(deleteId)
            setDeleteId(null)
            load()
        } catch (err) {
            setError(apiMessage(err, t('teacherAssignments.errorDelete')))
        }
    }

    const openAttach = (a) => {
        setAttachTarget(a)
        setAttachFile(null)
        setAttachOpen(true)
    }

    const handleUploadAttachment = async () => {
        if (!attachFile) return
        setAttachSaving(true)
        try {
            await assignmentService.uploadAttachmentById(attachTarget.id, attachFile)
            setAttachOpen(false)
            load()
        } catch (err) {
            setError(apiMessage(err, t('teacherAssignments.errorUpload')))
        } finally {
            setAttachSaving(false)
        }
    }

    const handleRemoveAttachment = async (id) => {
        try {
            await assignmentService.removeAttachmentById(id)
            load()
        } catch (err) {
            setError(apiMessage(err, t('teacherAssignments.errorRemoveFile')))
        }
    }

    const openSubs = async (a) => {
        setSubsTarget(a)
        setSubsOpen(true)
        setSubsLoading(true)
        setStatusFilter('ALL')
        setSelectedIds([])
        try {
            const res = await assignmentService.getSubmissionsByAssignment(a.id)
            setSubmissions(res.data)
        } catch {
            setSubmissions([])
        } finally {
            setSubsLoading(false)
        }
    }

    const downloadSub = async (sub) => {
        try {
            const res = await assignmentService.downloadSubmissionFile(sub.id)
            const url = URL.createObjectURL(res.data)
            const a = document.createElement('a')
            a.href = url
            a.download = sub.fileName || 'submission'
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            setError(apiMessage(err, t('teacherAssignments.errorDownload')))
        }
    }

    const previewSub = async (sub) => {
        try {
            const res = await assignmentService.previewSubmissionFile(sub.id)
            const url = URL.createObjectURL(res.data)
            window.open(url, '_blank', 'noopener')
            setTimeout(() => URL.revokeObjectURL(url), 60000)
        } catch (err) {
            setError(apiMessage(err, t('teacherAssignments.errorPreview')))
        }
    }

    const openGrade = (sub) => {
        setGradeTarget(sub)
        setGradeForm({ grade: sub.grade ?? '', feedback: sub.feedback || '' })
    }

    const handleGradeSave = async () => {
        setGradeSaving(true)
        try {
            const grade = gradeForm.grade === '' ? null : Number(gradeForm.grade)
            const res = await assignmentService.gradeSubmission(gradeTarget.id, grade, gradeForm.feedback || null)
            setSubmissions(subs => subs.map(s => (s.id === gradeTarget.id ? res.data : s)))
            setGradeTarget(null)
        } catch (err) {
            setError(err.response?.data?.message || t('teacherAssignments.errorGrade'))
        } finally {
            setGradeSaving(false)
        }
    }

    const visibleSubmissions = submissions.filter(sub => {
        if (statusFilter === 'ALL') return true
        if (statusFilter === 'UNGRADED') return sub.id && sub.status !== 'GRADED'
        return sub.status === statusFilter
    })

    const toggleSelected = (id) => {
        setSelectedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
    }

    const downloadZip = async () => {
        setZipLoading(true)
        try {
            const res = await assignmentService.downloadSubmissionsZip(subsTarget.id)
            const url = URL.createObjectURL(res.data)
            const a = document.createElement('a')
            a.href = url
            a.download = `submissions-${subsTarget.id}.zip`
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            setError(err.response?.data?.message || t('teacherAssignments.errorZip'))
        } finally {
            setZipLoading(false)
        }
    }

    const handleBulkGradeSave = async () => {
        setGradeSaving(true)
        try {
            const grade = gradeForm.grade === '' ? null : Number(gradeForm.grade)
            const res = await assignmentService.bulkGrade(selectedIds, grade, gradeForm.feedback || null)
            const byId = Object.fromEntries(res.data.map(r => [r.id, r]))
            setSubmissions(subs => subs.map(s => byId[s.id] ?? s))
            setBulkOpen(false)
            setSelectedIds([])
        } catch (err) {
            setError(err.response?.data?.message || t('teacherAssignments.errorGrade'))
        } finally {
            setGradeSaving(false)
        }
    }

    // Save current grade, then jump straight to the next ungraded submission
    const handleGradeSaveAndNext = async () => {
        const currentId = gradeTarget.id
        setGradeSaving(true)
        try {
            const grade = gradeForm.grade === '' ? null : Number(gradeForm.grade)
            const res = await assignmentService.gradeSubmission(currentId, grade, gradeForm.feedback || null)
            const updated = submissions.map(s => (s.id === currentId ? res.data : s))
            setSubmissions(updated)
            const next = updated.find(s => s.id && s.id !== currentId && s.status !== 'GRADED')
            if (next) {
                setGradeTarget(next)
                setGradeForm({ grade: next.grade ?? '', feedback: next.feedback || '' })
            } else {
                setGradeTarget(null)
            }
        } catch (err) {
            setError(err.response?.data?.message || t('teacherAssignments.errorGrade'))
        } finally {
            setGradeSaving(false)
        }
    }

    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="lg" className="flex-grow py-8 px-4 sm:px-6">

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <AssignmentRounded className="text-sky-600 !text-3xl" />
                        <Typography variant="h5" className="!font-extrabold !text-slate-900 dark:!text-white">
                            {t('teacherAssignments.title')}
                        </Typography>
                    </div>
                    <Button
                        variant="contained"
                        startIcon={<AddRounded />}
                        onClick={openCreate}
                        className="!rounded-xl !normal-case !bg-sky-600 hover:!bg-sky-700"
                    >
                        {t('teacherAssignments.addBtn')}
                    </Button>
                </div>

                {error && <Alert severity="error" className="!mb-4 !rounded-xl" onClose={() => setError('')}>{error}</Alert>}

                {loading ? (
                    <Box className="flex justify-center py-16"><CircularProgress className="!text-sky-500" /></Box>
                ) : assignments.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">{t('teacherAssignments.noAssignments')}</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {assignments.map(a => (
                            <Card key={a.id} elevation={0} className="rounded-2xl border border-slate-200 dark:!bg-slate-900/50 dark:!border-slate-700">
                                <CardContent className="!p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white">
                                                    {a.title}
                                                </Typography>
                                                {openStatusChip(a.isOpen)}
                                            </div>
                                            <Typography variant="caption" className="!text-slate-500 !block">
                                                {a.lessonTitle}
                                            </Typography>
                                            <Typography variant="caption" className="!text-slate-400 !block !mt-0.5">
                                                ⏰ {fmtDeadline(a.deadline, locale)}
                                            </Typography>
                                            {a.description && (
                                                <Typography variant="body2" className="!text-slate-600 dark:!text-slate-400 !mt-2 line-clamp-2">
                                                    {a.description}
                                                </Typography>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                                            <Tooltip title={t('teacherAssignments.tooltipSubmissions')}>
                                                <IconButton size="small" onClick={() => openSubs(a)} className="!text-slate-600 dark:!text-slate-400">
                                                    <PeopleRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={a.hasAttachment ? t('teacherAssignments.tooltipFile') : t('teacherAssignments.tooltipAttach')}>
                                                <IconButton size="small" onClick={() => openAttach(a)} className={a.hasAttachment ? '!text-sky-600' : '!text-slate-400'}>
                                                    <AttachFileRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('teacherAssignments.tooltipEdit')}>
                                                <IconButton size="small" onClick={() => openEdit(a)} className="!text-slate-600 dark:!text-slate-400">
                                                    <EditRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('teacherAssignments.tooltipDelete')}>
                                                <IconButton size="small" onClick={() => setDeleteId(a.id)} className="!text-red-500">
                                                    <DeleteRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </Container>

            <Footer />

            {}
            <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ className: 'rounded-2xl! dark:bg-slate-900!' }}>
                <DialogTitle className="!font-bold dark:!text-white">
                    {editing ? t('teacherAssignments.formEditTitle') : t('teacherAssignments.formTitle')}
                </DialogTitle>
                <DialogContent className="flex flex-col gap-4 !pt-2">
                    <FormControl fullWidth size="small">
                        <InputLabel>{t('teacherAssignments.formLesson')}</InputLabel>
                        <Select
                            value={form.lessonId}
                            onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}
                            label={t('teacherAssignments.formLesson')}
                            disabled={!!editing}
                        >
                            {lessons.map(l => (
                                <MenuItem key={l.id} value={l.id}>
                                    {l.subjectTitle} › {l.moduleTitle} › {l.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label={t('teacherAssignments.formTitulli')}
                        size="small"
                        fullWidth
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    />
                    <TextField
                        label={t('teacherAssignments.formDesc')}
                        size="small"
                        fullWidth
                        multiline
                        rows={3}
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                    <TextField
                        label={t('teacherAssignments.formDeadline')}
                        type="datetime-local"
                        size="small"
                        fullWidth
                        value={form.deadline}
                        onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions className="!px-6 !pb-4">
                    <Button onClick={() => setFormOpen(false)} className="!normal-case !text-slate-600">{t('teacherAssignments.cancel')}</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving || !form.title.trim() || !form.deadline || !form.lessonId}
                        className="!rounded-xl !normal-case !bg-sky-600 hover:!bg-sky-700"
                    >
                        {saving ? <CircularProgress size={18} className="!text-white" /> : t('teacherAssignments.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {}
            <Dialog open={attachOpen} onClose={() => setAttachOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ className: 'rounded-2xl! dark:bg-slate-900!' }}>
                <DialogTitle className="!font-bold dark:!text-white flex items-center justify-between">
                    {t('teacherAssignments.attachTitle')}
                    <IconButton size="small" onClick={() => setAttachOpen(false)}><CloseRounded fontSize="small" /></IconButton>
                </DialogTitle>
                <DialogContent className="!pt-2">
                    {attachTarget?.hasAttachment && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 mb-4">
                            <AttachFileRounded className="text-sky-600" fontSize="small" />
                            <Typography variant="body2" className="!flex-1 truncate dark:!text-slate-300">
                                {attachTarget.attachmentName}
                            </Typography>
                            <Tooltip title={t('teacherAssignments.removeFile')}>
                                <IconButton size="small" onClick={() => { handleRemoveAttachment(attachTarget.id); setAttachOpen(false) }} className="!text-red-500">
                                    <DeleteOutlineRounded fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </div>
                    )}
                    <label className="block cursor-pointer">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-sky-400 transition-colors">
                            <UploadFileRounded className="text-sky-600" />
                            <span className="text-sm text-slate-600 dark:text-slate-400 flex-1 truncate">
                                {attachFile ? attachFile.name : t('teacherAssignments.chooseFile')}
                            </span>
                        </div>
                        <input type="file" className="sr-only" onChange={e => setAttachFile(e.target.files?.[0] || null)} />
                    </label>
                </DialogContent>
                <DialogActions className="!px-6 !pb-4">
                    <Button onClick={() => setAttachOpen(false)} className="!normal-case !text-slate-600">{t('teacherAssignments.cancel')}</Button>
                    <Button
                        variant="contained"
                        disabled={!attachFile || attachSaving}
                        onClick={handleUploadAttachment}
                        className="!rounded-xl !normal-case !bg-sky-600 hover:!bg-sky-700"
                    >
                        {attachSaving ? <CircularProgress size={18} className="!text-white" /> : t('teacherAssignments.upload')}
                    </Button>
                </DialogActions>
            </Dialog>

            {}
            <Dialog open={subsOpen} onClose={() => setSubsOpen(false)} maxWidth="md" fullWidth
                PaperProps={{ className: 'rounded-2xl! dark:bg-slate-900!' }}>
                <DialogTitle className="!font-bold dark:!text-white flex items-center justify-between">
                    <span>
                        {t('teacherAssignments.submissionsTitle')}<span className="text-sky-600">{subsTarget?.title}</span>
                    </span>
                    <IconButton size="small" onClick={() => setSubsOpen(false)}><CloseRounded fontSize="small" /></IconButton>
                </DialogTitle>
                <DialogContent className="!pt-2">
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                        {Object.entries({
                            ALL: t('teacherAssignments.filterAll'),
                            LATE: t('teacherAssignments.filterLate'),
                            UNGRADED: t('teacherAssignments.filterUngraded'),
                            GRADED: t('teacherAssignments.filterGraded'),
                            NOT_SUBMITTED: t('teacherAssignments.filterNotSubmitted'),
                        }).map(([f, label]) => (
                            <Chip
                                key={f}
                                label={label}
                                size="small"
                                color={statusFilter === f ? 'primary' : 'default'}
                                onClick={() => setStatusFilter(f)}
                                className="!font-semibold cursor-pointer"
                            />
                        ))}
                        <span className="flex-1" />
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={zipLoading ? <CircularProgress size={14} /> : <FileDownloadRounded />}
                            disabled={zipLoading || !submissions.some(s => s.id)}
                            onClick={downloadZip}
                            className="!rounded-lg !normal-case"
                        >
                            {t('teacherAssignments.zipBtn')}
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            disabled={selectedIds.length === 0}
                            onClick={() => { setGradeForm({ grade: '', feedback: '' }); setBulkOpen(true) }}
                            className="!rounded-lg !normal-case !bg-emerald-600 hover:!bg-emerald-700"
                        >
                            {t('teacherAssignments.bulkGradeBtn')}{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                        </Button>
                    </div>
                    {subsLoading ? (
                        <Box className="flex justify-center py-8"><CircularProgress className="!text-sky-500" /></Box>
                    ) : visibleSubmissions.length === 0 ? (
                        <Typography variant="body2" className="!text-slate-500 text-center py-8">
                            {t('teacherAssignments.noSubmissions')}
                        </Typography>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {visibleSubmissions.map(sub => (
                                <div key={sub.id ?? `ns-${sub.studentId}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                    {sub.id ? (
                                        <Checkbox
                                            size="small"
                                            checked={selectedIds.includes(sub.id)}
                                            onChange={() => toggleSelected(sub.id)}
                                            className="!p-1"
                                        />
                                    ) : <span className="w-7" />}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                                                {sub.studentName}
                                            </Typography>
                                            {submissionStatusChip(sub)}
                                            {sub.grade != null && (
                                                <Typography variant="caption" className="!font-bold !text-sky-700 dark:!text-sky-300">
                                                    {t('teacherAssignments.gradedValueLabel')}{sub.grade}
                                                </Typography>
                                            )}
                                        </div>
                                        <Typography variant="caption" className="!text-slate-500 !block">
                                            {sub.studentEmail}
                                        </Typography>
                                        {sub.id && (
                                            <>
                                                <Typography variant="caption" className="!text-slate-500 !block">
                                                    {t('teacherAssignments.lessonLabel')}{sub.lessonTitle} · {formatDateTime(sub.submittedAt, locale)}
                                                </Typography>
                                                {sub.firstSubmittedAt && sub.firstSubmittedAt !== sub.submittedAt && (
                                                    <Typography variant="caption" className="!text-slate-400 !block">
                                                        {t('teacherAssignments.firstSubmittedLabel')}{formatDateTime(sub.firstSubmittedAt, locale)}
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" className="!text-slate-400 truncate !block">
                                                    {sub.fileName}
                                                </Typography>
                                            </>
                                        )}
                                    </div>
                                    {sub.id && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Tooltip title={t('teacherAssignments.previewTooltip')}>
                                                <IconButton size="small" onClick={() => previewSub(sub)} className="!text-slate-600 dark:!text-slate-400">
                                                    <VisibilityRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('teacherAssignments.downloadTooltip')}>
                                                <IconButton size="small" onClick={() => downloadSub(sub)} className="!text-sky-600">
                                                    <FileDownloadRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('teacherAssignments.gradeTooltip')}>
                                                <IconButton size="small" onClick={() => openGrade(sub)} className="!text-emerald-600">
                                                    <RateReviewRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {}
            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth
                PaperProps={{ className: 'rounded-2xl! dark:bg-slate-900!' }}>
                <DialogTitle className="!font-bold dark:!text-white">{t('teacherAssignments.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography className="dark:!text-slate-300">
                        {t('teacherAssignments.deleteBody')}
                    </Typography>
                </DialogContent>
                <DialogActions className="!px-6 !pb-4">
                    <Button onClick={() => setDeleteId(null)} className="!normal-case !text-slate-600">{t('teacherAssignments.cancel')}</Button>
                    <Button variant="contained" onClick={confirmDelete} className="!rounded-xl !normal-case !bg-red-600 hover:!bg-red-700">
                        {t('teacherAssignments.deleteBtn')}
                    </Button>
                </DialogActions>
            </Dialog>

            {}
            <Dialog open={!!gradeTarget} onClose={() => setGradeTarget(null)} maxWidth="xs" fullWidth
                PaperProps={{ className: 'rounded-2xl! dark:bg-slate-900!' }}>
                <DialogTitle className="!font-bold dark:!text-white">
                    {t('teacherAssignments.gradeTitle')} · {gradeTarget?.studentName}
                </DialogTitle>
                <DialogContent className="flex flex-col gap-4 !pt-2">
                    <TextField
                        label={t('teacherAssignments.gradeLabel')}
                        type="number"
                        size="small"
                        fullWidth
                        inputProps={{ min: 0, max: 100 }}
                        value={gradeForm.grade}
                        onChange={e => setGradeForm(f => ({ ...f, grade: e.target.value }))}
                    />
                    <TextField
                        label={t('teacherAssignments.feedbackLabel')}
                        size="small"
                        fullWidth
                        multiline
                        rows={3}
                        value={gradeForm.feedback}
                        onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions className="!px-6 !pb-4">
                    <Button onClick={() => setGradeTarget(null)} className="!normal-case !text-slate-600">{t('teacherAssignments.cancel')}</Button>
                    <Button
                        variant="contained"
                        onClick={handleGradeSave}
                        disabled={gradeSaving || (gradeForm.grade === '' && !gradeForm.feedback.trim())}
                        className="!rounded-xl !normal-case !bg-emerald-600 hover:!bg-emerald-700"
                    >
                        {gradeSaving ? <CircularProgress size={18} className="!text-white" /> : t('teacherAssignments.gradeSaveBtn')}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleGradeSaveAndNext}
                        disabled={gradeSaving || (gradeForm.grade === '' && !gradeForm.feedback.trim())}
                        className="!rounded-xl !normal-case"
                    >
                        {t('teacherAssignments.saveNextBtn')}
                    </Button>
                </DialogActions>
            </Dialog>

            {}
            <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ className: 'rounded-2xl! dark:bg-slate-900!' }}>
                <DialogTitle className="!font-bold dark:!text-white">
                    {t('teacherAssignments.bulkGradeTitle')} · {selectedIds.length} {t('teacherAssignments.selectedCount')}
                </DialogTitle>
                <DialogContent className="flex flex-col gap-4 !pt-2">
                    <TextField
                        label={t('teacherAssignments.gradeLabel')}
                        type="number"
                        size="small"
                        fullWidth
                        inputProps={{ min: 0, max: 100 }}
                        value={gradeForm.grade}
                        onChange={e => setGradeForm(f => ({ ...f, grade: e.target.value }))}
                    />
                    <TextField
                        label={t('teacherAssignments.feedbackLabel')}
                        size="small"
                        fullWidth
                        multiline
                        rows={3}
                        value={gradeForm.feedback}
                        onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions className="!px-6 !pb-4">
                    <Button onClick={() => setBulkOpen(false)} className="!normal-case !text-slate-600">{t('teacherAssignments.cancel')}</Button>
                    <Button
                        variant="contained"
                        onClick={handleBulkGradeSave}
                        disabled={gradeSaving || (gradeForm.grade === '' && !gradeForm.feedback.trim())}
                        className="!rounded-xl !normal-case !bg-emerald-600 hover:!bg-emerald-700"
                    >
                        {gradeSaving ? <CircularProgress size={18} className="!text-white" /> : t('teacherAssignments.gradeSaveBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
        </section>
    )
}

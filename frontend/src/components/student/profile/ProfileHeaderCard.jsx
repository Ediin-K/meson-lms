import { useRef, useState } from 'react'
import {
  Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, TextField, Tooltip, Typography,
} from '@mui/material'
import EditRounded from '@mui/icons-material/EditRounded'
import PhotoCameraRounded from '@mui/icons-material/PhotoCameraRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import LockResetRounded from '@mui/icons-material/LockResetRounded'
import { useAppPreferences } from '../../../context/appPreferencesContext.js'
import { formatDate } from '../../../lib/dateFormat.js'
import {
  uploadMyPhoto, removeMyPhoto, changeMyPassword, accountPhotoSrc,
} from '../../../services/accountService.js'
import { apiMessage } from '../../../lib/apiError.js'

function initials(emri, mbiemri) {
  const a = (emri || '').trim().charAt(0)
  const b = (mbiemri || '').trim().charAt(0)
  return `${a}${b}`.toUpperCase() || '?'
}

export default function ProfileHeaderCard({ profile, account, t, onSave, saving, onPhotoChanged, notify }) {
  const { locale } = useAppPreferences()
  const fileRef = useRef(null)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ emri: '', mbiemri: '', phoneNumber: '' })

  const [pwOpen, setPwOpen] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)

  const [photoBusy, setPhotoBusy] = useState(false)
  const [bust, setBust] = useState(() => Date.now())

  if (!profile) return null

  const hasPhoto = account?.hasPhoto
  const accountId = account?.id

  const openEdit = () => {
    setForm({
      emri: profile?.emri || '',
      mbiemri: profile?.mbiemri || '',
      phoneNumber: profile?.phoneNumber || '',
    })
    setOpen(true)
  }

  const handleSave = async () => {
    await onSave(form)
    setOpen(false)
  }

  const onPickPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (file) fileRef.current.value = ''
    if (!file) return
    setPhotoBusy(true)
    try {
      const updated = await uploadMyPhoto(file)
      setBust(Date.now())
      onPhotoChanged?.(updated)
      notify?.(t('account.photoUpdated'))
    } catch (err) {
      notify?.(apiMessage(err, t('account.photoError')), 'error')
    } finally {
      setPhotoBusy(false)
    }
  }

  const onRemovePhoto = async () => {
    setPhotoBusy(true)
    try {
      const updated = await removeMyPhoto()
      onPhotoChanged?.(updated)
      notify?.(t('account.photoRemoved'))
    } catch (err) {
      notify?.(apiMessage(err, t('account.photoError')), 'error')
    } finally {
      setPhotoBusy(false)
    }
  }

  const submitPassword = async () => {
    if (pwForm.next.length < 8) return notify?.(t('account.pwTooShort'), 'error')
    if (pwForm.next !== pwForm.confirm) return notify?.(t('account.pwMismatch'), 'error')
    setPwSaving(true)
    try {
      await changeMyPassword(pwForm.current, pwForm.next)
      setPwOpen(false)
      setPwForm({ current: '', next: '', confirm: '' })
      notify?.(t('account.pwUpdated'))
    } catch (err) {
      notify?.(apiMessage(err, t('account.pwError')), 'error')
    } finally {
      setPwSaving(false)
    }
  }

  const roleLabel = account?.role
    ? t(`account.role.${account.role}`)
    : t('studentProfile.roleStudent')

  return (
    <>
      <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!border-slate-700/80 dark:!bg-slate-900">
        <CardContent className="!p-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar with camera overlay */}
            <div className="relative mb-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-3xl font-bold text-sky-700 ring-4 ring-white dark:bg-sky-900/50 dark:text-sky-300 dark:ring-slate-900">
                {photoBusy ? (
                  <CircularProgress size={28} className="!text-sky-500" />
                ) : hasPhoto && accountId ? (
                  <img
                    src={accountPhotoSrc(accountId, bust)}
                    alt={t('account.photoAlt')}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials(profile.emri, profile.mbiemri)
                )}
              </div>
              <Tooltip title={t('account.changePhoto')}>
                <IconButton
                  size="small"
                  onClick={() => fileRef.current?.click()}
                  disabled={photoBusy}
                  className="!absolute !bottom-0 !right-0 !bg-sky-600 !text-white hover:!bg-sky-700"
                >
                  <PhotoCameraRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={onPickPhoto}
              />
            </div>
            {hasPhoto && (
              <Button
                size="small"
                startIcon={<DeleteOutlineRounded fontSize="small" />}
                onClick={onRemovePhoto}
                disabled={photoBusy}
                className="!mb-1 !normal-case !text-slate-500"
              >
                {t('account.removePhoto')}
              </Button>
            )}

            <Typography variant="h6" className="!font-bold !text-slate-900 dark:!text-white">
              {profile.emri} {profile.mbiemri}
            </Typography>
            <Chip label={roleLabel} size="small" color="primary" className="!mt-2 !font-bold" />
            <Typography variant="body2" className="!mt-3 !text-slate-600 dark:!text-slate-300">
              {profile.email}
            </Typography>
            {profile.phoneNumber ? (
              <Typography variant="body2" className="!text-slate-500">
                {profile.phoneNumber}
              </Typography>
            ) : null}
            {profile.dataKrijimit ? (
              <Typography variant="caption" className="!mt-2 !text-slate-500">
                {t('studentProfile.memberSince')}: {formatDate(profile.dataKrijimit, locale)}
              </Typography>
            ) : null}
            {profile.departmentName ? (
              <Typography variant="caption" className="!mt-1 !block !text-sky-600 dark:!text-sky-400">
                {profile.departmentName}
                {profile.currentSemester ? ` · ${t('studentProfile.semester')} ${profile.currentSemester}` : ''}
              </Typography>
            ) : null}

            <div className="mt-4 flex w-full flex-col gap-2">
              <Button startIcon={<EditRounded />} variant="outlined" size="small" onClick={openEdit}>
                {t('studentProfile.edit')}
              </Button>
              <Button startIcon={<LockResetRounded />} variant="text" size="small" onClick={() => setPwOpen(true)}>
                {t('account.changePassword')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit info */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('studentProfile.editTitle')}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-2">
          <TextField label={t('studentProfile.firstName')} value={form.emri}
            onChange={(e) => setForm((f) => ({ ...f, emri: e.target.value }))} required fullWidth />
          <TextField label={t('studentProfile.lastName')} value={form.mbiemri}
            onChange={(e) => setForm((f) => ({ ...f, mbiemri: e.target.value }))} required fullWidth />
          <TextField label={t('studentProfile.phone')} value={form.phoneNumber}
            onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('studentProfile.cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{t('studentProfile.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Change password */}
      <Dialog open={pwOpen} onClose={() => setPwOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('account.changePassword')}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-2">
          <TextField type="password" label={t('account.currentPassword')} value={pwForm.current}
            onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} required fullWidth />
          <TextField type="password" label={t('account.newPassword')} value={pwForm.next}
            onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} required fullWidth />
          <TextField type="password" label={t('account.confirmPassword')} value={pwForm.confirm}
            onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} required fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwOpen(false)}>{t('studentProfile.cancel')}</Button>
          <Button variant="contained" onClick={submitPassword}
            disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}>
            {pwSaving ? <CircularProgress size={18} className="!text-white" /> : t('studentProfile.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

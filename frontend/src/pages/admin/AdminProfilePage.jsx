import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert, Box, Button, Card, CardContent, CircularProgress,
  Container, Snackbar, Typography,
} from '@mui/material'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import PeopleRounded from '@mui/icons-material/PeopleRounded'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'
import CategoryRounded from '@mui/icons-material/CategoryRounded'
import GroupsRounded from '@mui/icons-material/GroupsRounded'
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded'
import AdminPanelSettingsRounded from '@mui/icons-material/AdminPanelSettingsRounded'
import PersonAddRounded from '@mui/icons-material/PersonAddRounded'
import ManageAccountsRounded from '@mui/icons-material/ManageAccountsRounded'
import LabelRounded from '@mui/icons-material/LabelRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import { useAppPreferences } from '../../context/appPreferencesContext'
import Footer from '../../components/ui/Footer'
import ProfileHeaderCard from '../../components/student/profile/ProfileHeaderCard'
import { getMyAccount, updateMyAccount } from '../../services/accountService'
import { getAdminStats } from '../../services/adminProfileService'

function StatCard({ icon: Icon, label, value, colorClass, bgClass }) {
  return (
    <Card
      elevation={0}
      className="rounded-2xl border border-slate-200/80 bg-white dark:!border-slate-700/80 dark:!bg-slate-900"
    >
      <CardContent className="!flex !items-center !gap-4 !p-5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bgClass} ${colorClass}`}>
          <Icon fontSize="small" />
        </div>
        <div>
          <Typography
            variant="caption"
            className="!font-semibold !uppercase !tracking-wide !text-slate-500 dark:!text-slate-400"
          >
            {label}
          </Typography>
          <Typography variant="h5" className="!font-extrabold !text-slate-900 dark:!text-white">
            {value ?? '—'}
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickLink({ icon: Icon, title, desc, path, color, bg, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(path)}
      className="group flex w-full items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-sky-200 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/50 dark:hover:border-sky-700/60"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}>
        <Icon fontSize="small" />
      </div>
      <div className="min-w-0 flex-1">
        <Typography variant="body2" className="!font-bold !text-slate-800 dark:!text-white">
          {title}
        </Typography>
        <Typography variant="caption" className="!text-slate-500 dark:!text-slate-400 !line-clamp-1">
          {desc}
        </Typography>
      </div>
      <ArrowForwardRounded
        fontSize="small"
        className="mt-1 shrink-0 text-slate-300 transition group-hover:text-sky-500 dark:text-slate-600"
      />
    </button>
  )
}

export default function AdminProfilePage() {
  const { t } = useAppPreferences()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [stats, setStats] = useState(null)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const notify = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    const [accountRes, statsRes] = await Promise.allSettled([
      getMyAccount(),
      getAdminStats(),
    ])
    if (accountRes.status === 'fulfilled') setAccount(accountRes.value)
    if (statsRes.status === 'fulfilled') setStats(statsRes.value)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveProfile = async (form) => {
    try {
      setSaving(true)
      const updated = await updateMyAccount(form)
      setAccount(updated)
      notify(t('adminProfile.saveSuccess'))
    } catch (err) {
      notify(err.response?.data?.message || t('adminProfile.saveError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const quickLinks = [
    {
      title: t('home.admin.services.users.title'),
      desc: t('home.admin.services.users.desc'),
      icon: PeopleRounded,
      path: '/admin/users',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-100 dark:bg-indigo-900/40',
    },
    {
      title: t('home.admin.services.subjects.title'),
      desc: t('home.admin.services.subjects.desc'),
      icon: SchoolRounded,
      path: '/admin/subjects',
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-100 dark:bg-sky-900/40',
    },
    {
      title: t('home.admin.services.departments.title'),
      desc: t('home.admin.services.departments.desc'),
      icon: CategoryRounded,
      path: '/admin/departments',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/40',
    },
    {
      title: t('home.admin.services.enrollments.title'),
      desc: t('home.admin.services.enrollments.desc'),
      icon: AssignmentRounded,
      path: '/admin/enrollments',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-100 dark:bg-rose-900/40',
    },
    {
      title: t('home.admin.services.certificates.title'),
      desc: t('home.admin.services.certificates.desc'),
      icon: WorkspacePremiumRounded,
      path: '/admin/certificates',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    },
    {
      title: t('adminProfile.quickLinks.groups'),
      desc: t('adminProfile.quickLinks.groupsDesc'),
      icon: GroupsRounded,
      path: '/admin/groups',
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-100 dark:bg-violet-900/40',
    },
    {
      title: t('adminProfile.quickLinks.schedules'),
      desc: t('adminProfile.quickLinks.schedulesDesc'),
      icon: CalendarMonthRounded,
      path: '/admin/schedules',
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-100 dark:bg-cyan-900/40',
    },
    {
      title: t('adminProfile.quickLinks.roles'),
      desc: t('adminProfile.quickLinks.rolesDesc'),
      icon: AdminPanelSettingsRounded,
      path: '/admin/roles',
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-100 dark:bg-teal-900/40',
    },
    {
      title: t('adminProfile.quickLinks.groupApplications'),
      desc: t('adminProfile.quickLinks.groupApplicationsDesc'),
      icon: PersonAddRounded,
      path: '/admin/group-applications',
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-100 dark:bg-pink-900/40',
    },
    {
      title: t('adminProfile.quickLinks.userClaims'),
      desc: t('adminProfile.quickLinks.userClaimsDesc'),
      icon: LabelRounded,
      path: '/admin/user-claims',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/40',
    },
    {
      title: t('adminProfile.quickLinks.teachers'),
      desc: t('adminProfile.quickLinks.teachersDesc'),
      icon: ManageAccountsRounded,
      path: '/admin/teachers',
      color: 'text-lime-700 dark:text-lime-400',
      bg: 'bg-lime-100 dark:bg-lime-900/40',
    },
    {
      title: t('adminProfile.quickLinks.reports'),
      desc: t('adminProfile.quickLinks.reportsDesc'),
      icon: AssignmentRounded,
      path: '/admin/reports',
      color: 'text-slate-600 dark:text-slate-300',
      bg: 'bg-slate-100 dark:bg-slate-700/60',
    },
  ]

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-24">
        <CircularProgress className="!text-sky-500" />
      </Box>
    )
  }

  return (
    <section className="flex min-h-screen flex-col">
      <Container maxWidth="lg" className="mt-4 flex-grow px-4 py-8 sm:mt-8 sm:px-6 lg:px-8">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate('/admin')}
          className="!mb-6 !normal-case !text-slate-500 hover:!text-slate-700 dark:!text-slate-400 dark:hover:!text-slate-200"
          size="small"
        >
          {t('adminProfile.backToDashboard')}
        </Button>

        <Box className="mb-10">
          <Typography
            variant="overline"
            className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400"
          >
            {t('adminProfile.overline')}
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            className="!mt-1 !font-extrabold !text-slate-900 dark:!text-white"
          >
            {t('adminProfile.title')}
          </Typography>
          <Typography
            variant="body1"
            className="!mt-2 !text-slate-500 dark:!text-slate-400"
          >
            {t('adminProfile.subtitle')}
          </Typography>
        </Box>

        {/* Platform stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={PeopleRounded}
            label={t('home.admin.stats.users')}
            value={stats?.totalUsers}
            colorClass="text-indigo-600 dark:text-indigo-400"
            bgClass="bg-indigo-100 dark:bg-indigo-900/40"
          />
          <StatCard
            icon={SchoolRounded}
            label={t('home.admin.stats.subjects')}
            value={stats?.totalSubjects}
            colorClass="text-sky-600 dark:text-sky-400"
            bgClass="bg-sky-100 dark:bg-sky-900/40"
          />
          <StatCard
            icon={AssignmentRounded}
            label={t('home.admin.stats.enrollments')}
            value={stats?.totalEnrollments}
            colorClass="text-amber-600 dark:text-amber-400"
            bgClass="bg-amber-100 dark:bg-amber-900/40"
          />
          <StatCard
            icon={WorkspacePremiumRounded}
            label={t('home.admin.services.certificates.title')}
            value={stats?.totalCertificates}
            colorClass="text-emerald-600 dark:text-emerald-400"
            bgClass="bg-emerald-100 dark:bg-emerald-900/40"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: profile card */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <ProfileHeaderCard
              profile={account}
              account={account}
              t={t}
              onSave={handleSaveProfile}
              saving={saving}
              onPhotoChanged={setAccount}
              notify={notify}
            />

            {/* System role card */}
            <Card
              elevation={0}
              className="rounded-2xl border border-slate-200/80 bg-white dark:!border-slate-700/80 dark:!bg-slate-900"
            >
              <CardContent className="!p-5">
                <Typography
                  variant="subtitle2"
                  className="!mb-4 !font-bold !text-slate-900 dark:!text-white flex items-center gap-2"
                >
                  <AdminPanelSettingsRounded fontSize="small" className="text-indigo-500" />
                  {t('adminProfile.systemInfo.title')}
                </Typography>
                <div className="flex flex-col gap-3">
                  <div>
                    <Typography
                      variant="caption"
                      className="!font-semibold !uppercase !tracking-wider !text-slate-400 dark:!text-slate-500"
                    >
                      {t('adminProfile.systemInfo.role')}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-indigo-600 dark:!text-indigo-400 capitalize"
                    >
                      {account?.role ? t(`account.role.${account.role}`) : '—'}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="caption"
                      className="!font-semibold !uppercase !tracking-wider !text-slate-400 dark:!text-slate-500"
                    >
                      {t('adminProfile.systemInfo.email')}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-slate-800 dark:!text-slate-200 break-all"
                    >
                      {account?.email || '—'}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="caption"
                      className="!font-semibold !uppercase !tracking-wider !text-slate-400 dark:!text-slate-500"
                    >
                      {t('adminProfile.systemInfo.platform')}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-slate-800 dark:!text-slate-200"
                    >
                      Meson LMS
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: quick links */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card
              elevation={0}
              className="rounded-2xl border border-slate-200/80 bg-white dark:!border-slate-700/80 dark:!bg-slate-900"
            >
              <CardContent className="!p-5">
                <Typography
                  variant="subtitle1"
                  className="!mb-4 !font-bold !text-slate-900 dark:!text-white"
                >
                  {t('adminProfile.quickLinks.title')}
                </Typography>
                <div className="grid gap-3 sm:grid-cols-2">
                  {quickLinks.map((link) => (
                    <QuickLink
                      key={link.path}
                      {...link}
                      onClick={navigate}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>

      <Footer />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </section>
  )
}

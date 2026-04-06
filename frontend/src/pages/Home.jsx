import { createElement, useMemo, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import PaletteRounded from '@mui/icons-material/PaletteRounded'
import CodeRounded from '@mui/icons-material/CodeRounded'
import GraphicEqRounded from '@mui/icons-material/GraphicEqRounded'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import ViewQuiltRounded from '@mui/icons-material/ViewQuiltRounded'
import ThreeDRotationRounded from '@mui/icons-material/ThreeDRotationRounded'
import CampaignRounded from '@mui/icons-material/CampaignRounded'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded'
import AdminPanelSettingsRounded from '@mui/icons-material/AdminPanelSettingsRounded'
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded'
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined'
import FunctionsRounded from '@mui/icons-material/FunctionsRounded'
import CalculateRounded from '@mui/icons-material/CalculateRounded'
import DataObjectRounded from '@mui/icons-material/DataObjectRounded'
import CampaignOutlined from '@mui/icons-material/CampaignOutlined'

import { useAppPreferences } from '../context/appPreferencesContext.js'
import { STRINGS } from '../lib/mesonStrings.js'
import Footer from '../components/ui/Footer.jsx'
import heroImg from '../assets/images/ubt.webp'

const SLIDE_ACCENTS = [
  'from-sky-600/90 via-cyan-600/75 to-indigo-800/85',
  'from-indigo-700/90 via-violet-600/80 to-sky-700/85',
  'from-teal-700/88 via-sky-600/80 to-blue-900/88',
  'from-slate-800/90 via-sky-800/75 to-indigo-900/88',
]

const CHIP_KEYS = {
  partner: 'home.chipPartner',
  offer: 'home.chipOffer',
  soon: 'home.chipSoon',
  new: 'home.chipNew',
}

function chipLabel(chipKey, t) {
  if (!chipKey) return null
  const path = CHIP_KEYS[chipKey]
  return path ? t(path) : null
}

const universities = [
  {
    title: 'Universiteti UBT',
    meta: 'Prishtinë · Kosovë',
    chipKey: 'partner',
    chipColor: 'primary',
    icon: SchoolRounded,
  },
  {
    title: 'Universiteti i Prishtinës',
    meta: 'Prishtinë · Kosovë',
    chipKey: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
  {
    title: 'Universiteti i Tiranës',
    meta: 'Tiranë · Shqipëri',
    chipKey: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
  {
    title: 'Universiteti Politeknik i Tiranës',
    meta: 'Tiranë · Shqipëri',
    chipKey: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
  {
    title: 'Universiteti i Shkodrës',
    meta: 'Shkodër · Shqipëri',
    chipKey: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
  {
    title: 'Universiteti i Prizrenit',
    meta: 'Prizren · Kosovë',
    chipKey: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
  {
    title: 'Kolegji AAB',
    meta: 'Prishtinë · Kosovë',
    chipKey: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
  {
    title: 'Universiteti i Elbasanit',
    meta: 'Elbasan · Shqipëri',
    chipKey: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
]

const categories = [
  {
    title: 'Histori e artit',
    meta: '-50% · 3 kurse',
    icon: PaletteRounded,
    chipKey: 'offer',
    chipColor: 'error',
  },
  {
    title: 'UI & UX',
    meta: 'Së shpejti · 16 kurse',
    icon: ViewQuiltRounded,
    chipKey: 'soon',
    chipColor: 'default',
  },
  {
    title: 'Dizajn 3D',
    meta: '4 kurse',
    icon: ThreeDRotationRounded,
    chipKey: null,
    chipColor: 'default',
  },
  {
    title: 'Media & PR',
    meta: '9 kurse',
    icon: CampaignRounded,
    chipKey: null,
    chipColor: 'default',
  },
  {
    title: 'Programim',
    meta: 'E re · 2 kurse',
    icon: CodeRounded,
    chipKey: 'new',
    chipColor: 'success',
  },
  {
    title: 'Muzikë',
    meta: '6 kurse',
    icon: GraphicEqRounded,
    chipKey: null,
    chipColor: 'default',
  },
  {
    title: 'Gjuhë',
    meta: '3 kurse',
    icon: TranslateRounded,
    chipKey: null,
    chipColor: 'default',
  },
]

const cardShell =
  'group overflow-hidden rounded-[1.35rem] border border-sky-100/90 bg-white/90 shadow-md shadow-sky-100/40 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-200/50 dark:border-slate-700/90 dark:bg-slate-900/85 dark:shadow-black/40 dark:hover:border-slate-600 dark:hover:shadow-black/50'

const mediaShell = 'relative aspect-[16/10] overflow-hidden rounded-t-[1.35rem] bg-slate-100 dark:bg-slate-800'

function SpotlightCard({
  title,
  meta,
  icon,
  chip,
  chipColor,
  actionLabel,
  actionExternal,
  imgLoading,
}) {
  const IconGlyph = icon
  return (
    <Card elevation={0} className={cardShell}>

      <Box className={mediaShell}>
        <img
          src={heroImg}
          alt=""
          loading={imgLoading ?? 'lazy'}
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/15 to-sky-500/10" />
        {chip ? (
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <Chip
              label={chip}
              size="small"
              color={chipColor === 'default' ? 'default' : chipColor}
              className={
                chipColor === 'default'
                  ? '!bg-white/90 !font-semibold !text-slate-700 dark:!bg-slate-800/90 dark:!text-slate-300'
                  : chipColor === 'primary'
                    ? '!bg-sky-600 !font-semibold !text-white'
                    : '!font-semibold'
              }
            />
          </div>
        ) : null}
        <div className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 text-sky-600 shadow-md backdrop-blur-sm dark:bg-slate-800/95 dark:text-sky-400">
          <IconGlyph fontSize="medium" />
        </div>
      </Box>
      <CardContent className="!rounded-b-[1.35rem] !p-4 !pt-3">
        <Typography variant="h6" component="h3" className="!font-bold !text-slate-800 dark:!text-white">
          {title}
        </Typography>
        <Typography variant="body2" className="!mt-0.5 !text-slate-500 dark:!text-slate-400">
          {meta}
        </Typography>
      </CardContent>
    </Card>
  )
}

const STUDENT_SUBJECT_ROWS = [
  { id: 'cs', icon: CodeRounded },
  { id: 'discrete', icon: FunctionsRounded },
  { id: 'signals', icon: GraphicEqRounded },
  { id: 'algo', icon: DataObjectRounded },
  { id: 'math', icon: CalculateRounded },
  { id: 'english', icon: TranslateRounded },
]

const STUDENT_TASK_KEYS = ['task1', 'task2', 'task3']

function StudentFacultyBanner({ t }) {
  return (

    <section
      className="mb-6 rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 via-white to-slate-50 p-5 shadow-sm ring-1 ring-sky-100/60 sm:p-6 dark:border-slate-700/70 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-950 dark:to-indigo-950/60 dark:ring-slate-600/60"
      aria-labelledby="student-faculty-heading"
    >
      <Typography
        variant="overline"
        className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400"
      >
        {t('home.student.facultyOverline')}
      </Typography>
      <Typography
        id="student-faculty-heading"
        variant="h5"
        component="h2"
        className="!mt-1 !font-bold !text-slate-900 dark:!text-white"
      >
        {t('home.student.facultyTitle')}
      </Typography>
      <Typography variant="body2" className="!mt-2 !max-w-2xl !text-slate-600 dark:!text-slate-400">
        {t('home.student.facultyBody')}
      </Typography>
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-sky-100/80 bg-white/90 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-600/80 dark:bg-slate-900/85">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
            <SchoolRounded />
          </span>
          <div>
            <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white">
              {t('home.student.facultyName')}
            </Typography>
            <Typography variant="body2" className="!text-slate-600 dark:!text-slate-400">
              {t('home.student.facultyMeta')}
            </Typography>
            <Typography variant="caption" className="!mt-1 !block !text-slate-500 dark:!text-slate-500">
              {t('home.student.facultyProgram')}
            </Typography>
          </div>
        </div>
      </div>
    </section>
  )
}

function StudentDashboard({ t }) {
  return (

    <section
      className="mb-6 rounded-2xl border border-sky-200/60 bg-white/90 p-4 shadow-sm ring-1 ring-sky-100/50 sm:p-6 dark:border-slate-700/60 dark:bg-slate-900/85 dark:ring-slate-600/50"
      aria-labelledby="student-dash-heading"
    >
      <Typography
        id="student-dash-heading"
        variant="overline"
        className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400"
      >
        {t('home.student.overline')}
      </Typography>
      <Typography variant="h5" component="h2" className="!mt-1 !font-bold !text-slate-800 dark:!text-white">
        {t('home.student.welcome')}
      </Typography>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5 lg:items-stretch">
        {/* Majtas: njoftime të shpejta */}
        <aside className="order-2 flex flex-col lg:order-1 lg:col-span-3">
          <Card
            elevation={0}
            component="section"
            aria-labelledby="student-news-heading"
            className="h-full rounded-2xl border border-amber-200/55 bg-amber-50/35 p-4 ring-1 ring-amber-100/60 dark:border-amber-700/55 dark:bg-amber-950/35 dark:ring-amber-600/60"
          >
            <Typography
              id="student-news-heading"
              variant="subtitle2"
              className="!mb-3 !flex !items-center !gap-2 !font-bold !text-amber-950 dark:!text-amber-100"
            >
              <CampaignOutlined className="text-amber-700" fontSize="small" />
              {t('home.student.announcementsTitle')}
            </Typography>
            <ul className="list-none space-y-2.5 p-0">
              <li>
                <Typography variant="body2" className="!text-slate-800 dark:!text-slate-200">
                  • {t('home.student.announcement1')}
                </Typography>
              </li>
              <li>
                <Typography variant="body2" className="!text-slate-800 dark:!text-slate-200">
                  • {t('home.student.announcement2')}
                </Typography>
              </li>
            </ul>
          </Card>
        </aside>

        {/* Mes: vazhdo ku e le */}
        <div className="order-1 lg:order-2 lg:col-span-6">
          <Card
            elevation={0}
            className="flex h-full min-h-[220px] flex-col justify-center rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/90 via-white to-sky-50/40 p-5 sm:min-h-[260px] sm:p-6 dark:border-slate-700/80 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950/40"
          >
            <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white">
              {t('home.student.continueTitle')}
            </Typography>
            <Typography variant="body2" className="!mt-2 !text-slate-600 dark:!text-slate-400">
              {t('home.student.continueCourse')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              className="!mt-5 !w-full !rounded-full !bg-sky-600 !py-2.5 !font-semibold !normal-case hover:!bg-sky-700 sm:!mt-6 sm:!w-auto"
              startIcon={<MenuBookOutlined />}
            >
              {t('home.student.continueBtn')}
            </Button>
          </Card>
        </div>

        {/* Djathtas: detyra, afate, zgjatje, % sipas lëndës */}
        <aside className="order-3 lg:col-span-3">
          <Card
            elevation={0}
            component="section"
            aria-labelledby="student-tasks-heading"
            className="h-full rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 dark:border-slate-700/90 dark:bg-slate-900/50"
          >
            <Typography
              id="student-tasks-heading"
              variant="subtitle2"
              className="!flex !items-center !gap-2 !font-bold !text-slate-900 dark:!text-white"
            >
              <AssignmentTurnedInRounded className="text-sky-600" fontSize="small" />
              {t('home.student.tasks.panelTitle')}
            </Typography>
            <Typography variant="caption" className="!mt-1 !mb-3 !block !text-slate-500 dark:!text-slate-400">
              {t('home.student.tasks.panelSubtitle')}
            </Typography>
            <div className="flex flex-col gap-3">
              {STUDENT_TASK_KEYS.map((key) => {
                const pct = Math.min(
                  100,
                  Math.max(0, parseInt(t(`home.student.tasks.${key}.progress`), 10) || 0),
                )
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm dark:border-slate-600/80 dark:bg-slate-800"
                  >
                    <Typography variant="body2" className="!font-semibold !text-slate-900 dark:!text-white">
                      {t(`home.student.tasks.${key}.name`)}
                    </Typography>
                    <Typography variant="caption" className="!mt-0.5 !block !font-medium !text-sky-700 dark:!text-sky-400">
                      {t(`home.student.tasks.${key}.course`)}
                    </Typography>
                    <Typography variant="caption" className="!mt-1.5 !block !text-slate-600 dark:!text-slate-400">
                      {t(`home.student.tasks.${key}.due`)}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="!mt-0.5 !block !text-amber-900/90 dark:!text-amber-300/90"
                    >
                      {t(`home.student.tasks.${key}.extension`)}
                    </Typography>
                    <div className="mt-2.5 flex items-center gap-2">
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        className="!h-2 !flex-1 !rounded-full"
                        sx={{
                          height: 8,
                          borderRadius: 9999,
                          backgroundColor: 'rgba(15, 23, 42, 0.08)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 9999,
                            backgroundColor: '#0284c7',
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        className="!shrink-0 !font-bold !tabular-nums !text-slate-700 dark:!text-slate-300"
                      >
                        {pct}% {t('home.student.tasks.progressLabel')}
                      </Typography>
                    </div>
                  </div>
                )
              })}
            </div>
            <Button
              size="small"
              className="!mt-3 !w-full !font-semibold !text-sky-700 hover:!bg-sky-50 dark:!text-sky-400 dark:hover:!bg-sky-950"
            >
              {t('home.student.assignLink')}
            </Button>
          </Card>
        </aside>
      </div>

      <Typography variant="body2" className="!mt-5 !text-slate-600 dark:!text-slate-400">
        {t('home.student.dashboardHint')}
      </Typography>
    </section>
  )
}

function AdminOverview({ t }) {
  return (
    <section
      className="relative mb-6 min-h-[min(72vw,380px)] overflow-hidden rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 shadow-xl sm:min-h-[420px]"
      aria-labelledby="admin-overview-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(56,189,248,0.12),_transparent_50%)]" />
      <div className="relative z-[1] flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
        <div>
          <Typography
            variant="overline"
            className="!font-semibold !tracking-widest !text-sky-300/90"
          >
            {t('home.admin.overline')}
          </Typography>
          <Typography
            id="admin-overview-heading"
            variant="h4"
            component="h1"
            className="!mt-2 !font-bold !text-white"
          >
            {t('home.admin.title')}
          </Typography>
          <Typography variant="body1" className="!mt-2 !max-w-xl !text-slate-300">
            {t('home.admin.body')}
          </Typography>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: t('home.admin.statUsers'), value: '1.2k', icon: PeopleAltRounded },
            { label: t('home.admin.statCourses'), value: '48', icon: MenuBookOutlined },
            { label: t('home.admin.statAssign'), value: '126', icon: AssignmentTurnedInRounded },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
            >
              {createElement(icon, {
                className: 'text-sky-400',
                fontSize: 'small',
              })}
              <Typography variant="h5" className="!mt-2 !font-bold !text-white">
                {value}
              </Typography>
              <Typography variant="caption" className="!text-slate-400">
                {label}
              </Typography>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="contained"
            size="medium"
            startIcon={<AdminPanelSettingsRounded />}
            className="!rounded-full !bg-sky-500 !font-semibold !text-white hover:!bg-sky-400"
          >
            {t('home.admin.manageCourses')}
          </Button>
          <Button
            variant="outlined"
            size="medium"
            className="!rounded-full !border-white/50 !font-semibold !text-white hover:!border-white hover:!bg-white/10"
          >
            {t('home.admin.reports')}
          </Button>
          <Button
            variant="outlined"
            size="medium"
            className="!rounded-full !border-white/50 !font-semibold !text-white hover:!border-white hover:!bg-white/10"
          >
            {t('home.admin.users')}
          </Button>
        </div>
      </div>
    </section>
  )
}

const heroNavBtnClass =
  '!absolute !top-1/2 !z-20 !-translate-y-1/2 !cursor-pointer !border !border-white/40 !bg-white/15 !text-white !shadow-lg !backdrop-blur-md transition-[transform,background-color,box-shadow,border-color] duration-200 ease-out hover:!scale-110 hover:!border-white/70 hover:!bg-white/28 hover:!shadow-xl hover:!shadow-white/10 active:!scale-[0.92] active:!bg-white/35 focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-white'

export default function Home() {
  const swiperRef = useRef(null)
  const { locale, role, t } = useAppPreferences()

  const slides = useMemo(() => {
    const copy = STRINGS[locale]?.home?.slides ?? STRINGS.sq.home.slides
    return copy.map((s, i) => ({
      ...s,
      accent: SLIDE_ACCENTS[i] ?? SLIDE_ACCENTS[0],
    }))
  }, [locale])

  const showMarketingHero = role === 'guest'
  const showStudentDash = role === 'student'

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-sky-200/45 bg-gradient-to-b from-white via-sky-50/35 to-slate-50 px-2 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] ring-1 ring-sky-100/40 transition-colors dark:border-slate-700/45 dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/40 dark:shadow-black/10 dark:ring-slate-600/40 sm:px-4 sm:py-7">
        {showStudentDash ? <StudentDashboard t={t} /> : null}
        {showStudentDash ? <StudentFacultyBanner t={t} /> : null}

        {role === 'admin' ? <AdminOverview t={t} /> : null}

        {showMarketingHero ? (
          <section className="relative overflow-hidden rounded-3xl border border-sky-100/80 bg-slate-900 shadow-xl shadow-sky-200/30">
            <IconButton
              type="button"
              aria-label={t('home.heroPrev')}
              className={`${heroNavBtnClass} !left-2 sm:!left-3`}
              size="large"
              onClick={() => swiperRef.current?.slidePrev()}
            >
              <ChevronLeftRounded />
            </IconButton>
            <IconButton
              type="button"
              aria-label={t('home.heroNext')}
              className={`${heroNavBtnClass} !right-2 sm:!right-3`}
              size="large"
              onClick={() => swiperRef.current?.slideNext()}
            >
              <ChevronRightRounded />
            </IconButton>

            <Swiper
              modules={[Autoplay, Pagination, EffectFade]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              speed={900}
              loop
              autoplay={{ delay: 6000, disableOnInteraction: false }}
              pagination={{ clickable: true, dynamicBullets: true }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper
              }}
              className="hero-swiper min-h-[min(72vw,420px)] sm:min-h-[440px] md:min-h-[500px]"
            >
              {slides.map((slide, slideIndex) => (
                <SwiperSlide key={`slide-${slideIndex}`}>
                  <div className="relative grid min-h-[min(72vw,420px)] sm:min-h-[440px] md:min-h-[500px] md:grid-cols-12">
                    <div className="relative md:col-span-7 lg:col-span-8">
                      <img
                        src={heroImg}
                        alt=""
                        loading={slideIndex === 0 ? 'eager' : 'lazy'}
                        fetchPriority={slideIndex === 0 ? 'high' : 'low'}
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${slide.accent} mix-blend-multiply`}
                        aria-hidden
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent md:bg-gradient-to-r md:from-slate-950/70 md:via-slate-950/20 md:to-transparent" />
                    </div>

                    <div className="relative z-[1] flex flex-col justify-end gap-4 p-6 sm:p-8 md:col-span-5 md:justify-center lg:col-span-4 md:pr-10 md:pl-2">
                      <Typography
                        variant="overline"
                        className="!tracking-[0.2em] !text-sky-200/90"
                      >
                        {t('home.brand')}
                      </Typography>
                      <Typography
                        variant="h3"
                        component="h1"
                        className="!font-bold !leading-tight !text-white drop-shadow-sm sm:!text-4xl md:!text-[2.15rem] lg:!text-4xl"
                      >
                        {slide.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        className="!text-slate-100/95 !leading-relaxed md:!text-[1.02rem]"
                      >
                        {slide.subtitle}
                      </Typography>
                      <div className="flex flex-wrap gap-3 pt-1">
                        <Button
                          variant="contained"
                          size="large"
                          endIcon={<ArrowForwardRounded />}
                          className="!cursor-pointer !rounded-full !bg-white !px-6 !font-semibold !text-sky-800 !shadow-lg transition hover:!scale-[1.02] hover:!bg-sky-50 hover:!shadow-xl active:!scale-[0.98]"
                        >
                          {slide.cta}
                        </Button>
                        {slide.secondary ? (
                          <Button
                            variant="outlined"
                            size="large"
                            className="!cursor-pointer !rounded-full !border-white/70 !px-5 !font-semibold !text-white transition hover:!scale-[1.02] hover:!border-white hover:!bg-white/10 active:!scale-[0.98]"
                          >
                            {slide.secondary}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <style>{`
          .hero-swiper .swiper-pagination {
            bottom: 1.25rem !important;
            left: 50% !important;
            transform: translateX(-50%);
            width: auto !important;
          }
          .hero-swiper .swiper-pagination-bullet {
            width: 10px;
            height: 10px;
            background: rgba(255,255,255,0.45);
            opacity: 1;
            transition: transform 0.25s ease, background 0.25s ease;
          }
          .hero-swiper .swiper-pagination-bullet-active {
            background: #fff;
            transform: scale(1.25);
          }
        `}</style>
          </section>
        ) : null}

        {role === 'guest' ? (
          <Container maxWidth="lg" className="!px-0 sm:!px-3" sx={{ mt: 6, mb: 1 }}>
            <Box className="mb-8 text-center md:text-left">
              <Typography
                variant="overline"
                className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400"
              >
                {t('home.univOverline')}
              </Typography>
              <Typography
                variant="h4"
                component="h2"
                className="!mt-1 !font-bold !text-slate-800 dark:!text-white"
              >
                {t('home.univTitle')}
              </Typography>
              <Typography
                variant="body1"
                className="!mt-2 !max-w-2xl !text-slate-600 md:mx-0 mx-auto dark:!text-slate-400"
              >
                {t('home.univBody')}
              </Typography>
            </Box>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {universities.map((u) => (
                <SpotlightCard
                  key={u.title}
                  title={u.title}
                  meta={u.meta}
                  icon={u.icon}
                  chip={chipLabel(u.chipKey, t)}
                  chipColor={u.chipColor}
                  actionLabel={t('home.viewCampuses')}
                  actionExternal
                  imgLoading="lazy"
                />
              ))}
            </div>
          </Container>
        ) : null}

        {role === 'student' ? (
          <Container maxWidth="lg" className="!px-0 sm:!px-3" sx={{ mt: 2, mb: 0 }}>
            <Box className="mb-8 text-center md:text-left">
              <Typography
                variant="overline"
                className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400"
              >
                {t('home.student.subjects.overline')}
              </Typography>
              <Typography
                variant="h4"
                component="h2"
                className="!mt-1 !font-bold !text-slate-800 dark:!text-white"
              >
                {t('home.student.subjects.title')}
              </Typography>
              <Typography
                variant="body1"
                className="!mt-2 !max-w-2xl !text-slate-600 md:mx-0 mx-auto dark:!text-slate-400"
              >
                {t('home.student.subjects.body')}
              </Typography>
            </Box>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {STUDENT_SUBJECT_ROWS.map(({ id, icon }) => (
                <SpotlightCard
                  key={id}
                  title={t(`home.student.subjects.${id}.title`)}
                  meta={t(`home.student.subjects.${id}.meta`)}
                  icon={icon}
                  chip={t('home.student.subjects.chipActive')}
                  chipColor="success"
                  actionLabel={t('home.student.subjects.openSubject')}
                  actionExternal={false}
                  imgLoading="lazy"
                />
              ))}
            </div>
          </Container>
        ) : null}

        {role === 'guest' || role === 'admin' ? (
          <Container maxWidth="lg" className="!px-0 sm:!px-3" sx={{ mt: role === 'admin' ? 6 : 10, mb: 0 }}>
            <Box className="mb-8 text-center md:text-left">
              <Typography
                variant="overline"
                className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400"
              >
                {role === 'admin' ? t('home.admin.overline') : t('home.catOverline')}
              </Typography>
              <Typography
                variant="h4"
                component="h2"
                className="!mt-1 !font-bold !text-slate-800 dark:!text-white"
              >
                {role === 'admin' ? t('home.admin.browseCategories') : t('home.catTitle')}
              </Typography>
              <Typography
                variant="body1"
                className="!mt-2 !max-w-2xl !text-slate-600 md:mx-0 mx-auto dark:!text-slate-400"
              >
                {t('home.catBody')}
              </Typography>
            </Box>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((c) => (
                <SpotlightCard
                  key={c.title}
                  title={c.title}
                  meta={c.meta}
                  icon={c.icon}
                  chip={chipLabel(c.chipKey, t)}
                  chipColor={c.chipColor}
                  actionLabel={t('home.viewCourses')}
                  actionExternal={false}
                  imgLoading="lazy"
                />
              ))}
            </div>
          </Container>
        ) : null}
      </div>

      <div className="relative z-0 mt-12 w-screen max-w-none flex-shrink-0 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] sm:mt-14">
        <Footer />
      </div>
    </div>
  )
}

import { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
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

import Footer from '../components/ui/Footer.jsx'
import heroImg from '../assets/images/ubt.webp'

const slides = [
  {
    title: 'Get started',
    subtitle: 'Kurse, detyra dhe progresi yt — në një vend të thjeshtë.',
    cta: 'Sign up',
    secondary: null,
    accent: 'from-sky-600/90 via-cyan-600/75 to-indigo-800/85',
  },
  {
    title: 'Pse ky LMS është më i miri',
    subtitle:
      'UI i shpejtë dhe i qartë, i përshtatur për studentë dhe pedagogë — pa zhurmë.',
    cta: 'Zbulo arsyet',
    secondary: 'Më shumë',
    accent: 'from-indigo-700/90 via-violet-600/80 to-sky-700/85',
  },
  {
    title: 'Mëso nga kudo',
    subtitle: 'Celular, tablet apo shfletues — përmbajtja gjithmonë me ty.',
    cta: 'Hyr në kurset',
    secondary: 'Më shumë',
    accent: 'from-teal-700/88 via-sky-600/80 to-blue-900/88',
  },
  {
    title: 'Për shkolla & universitete',
    subtitle: 'Partnerë, kategori dhe raporte — i përshtatshëm për institucione.',
    cta: 'Na kontaktoni',
    secondary: 'Më shumë',
    accent: 'from-slate-800/90 via-sky-800/75 to-indigo-900/88',
  },
]

const heroNavBtnClass =
  '!absolute !top-1/2 !z-20 !-translate-y-1/2 !cursor-pointer !border !border-white/40 !bg-white/15 !text-white !shadow-lg !backdrop-blur-md transition-[transform,background-color,box-shadow,border-color] duration-200 ease-out hover:!scale-110 hover:!border-white/70 hover:!bg-white/28 hover:!shadow-xl hover:!shadow-white/10 active:!scale-[0.92] active:!bg-white/35 focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-white'

const universities = [
  {
    title: 'Universiteti UBT',
    meta: 'Prishtinë · Kosovë',
    chip: 'Partner',
    chipColor: 'primary',
    icon: SchoolRounded,
  },
  {
    title: 'Universiteti i Prishtinës',
    meta: 'Prishtinë · Kosovë',
    chip: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
  {
    title: 'Universiteti i Tiranës',
    meta: 'Tiranë · Shqipëri',
    chip: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
  {
    title: 'Universiteti Politeknik i Tiranës',
    meta: 'Tiranë · Shqipëri',
    chip: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
  {
    title: 'Universiteti i Shkodrës',
    meta: 'Shkodër · Shqipëri',
    chip: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
  {
    title: 'Universiteti i Prizrenit',
    meta: 'Prizren · Kosovë',
    chip: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
  {
    title: 'Kolegji AAB',
    meta: 'Prishtinë · Kosovë',
    chip: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
  {
    title: 'Universiteti i Elbasanit',
    meta: 'Elbasan · Shqipëri',
    chip: null,
    chipColor: 'default',
    icon: SchoolRounded,
  },
]

const categories = [
  {
    title: 'Histori e artit',
    meta: '-50% · 3 kurse',
    icon: PaletteRounded,
    chip: 'Ofertë',
    chipColor: 'error',
  },
  {
    title: 'UI & UX',
    meta: 'Së shpejti · 16 kurse',
    icon: ViewQuiltRounded,
    chip: 'Së shpejti',
    chipColor: 'default',
  },
  {
    title: 'Dizajn 3D',
    meta: '4 kurse',
    icon: ThreeDRotationRounded,
    chip: null,
    chipColor: 'default',
  },
  {
    title: 'Media & PR',
    meta: '9 kurse',
    icon: CampaignRounded,
    chip: null,
    chipColor: 'default',
  },
  {
    title: 'Programim',
    meta: 'E re · 2 kurse',
    icon: CodeRounded,
    chip: 'E re',
    chipColor: 'success',
  },
  {
    title: 'Muzikë',
    meta: '6 kurse',
    icon: GraphicEqRounded,
    chip: null,
    chipColor: 'default',
  },
  {
    title: 'Gjuhë',
    meta: '3 kurse',
    icon: TranslateRounded,
    chip: null,
    chipColor: 'default',
  },
]

const cardShell =
  'group overflow-hidden rounded-[1.35rem] border border-sky-100/90 bg-white/90 shadow-md shadow-sky-100/40 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-200/50'

const mediaShell = 'relative aspect-[16/10] overflow-hidden rounded-t-[1.35rem] bg-slate-100'

function SpotlightCard({ title, meta, icon: Icon, chip, chipColor, actionLabel }) {
  return (
    <Card elevation={0} className={cardShell}>
      <Box className={mediaShell}>
        <img
          src={heroImg}
          alt=""
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
                  ? '!bg-white/90 !font-semibold !text-slate-700'
                  : chipColor === 'primary'
                    ? '!bg-sky-600 !font-semibold !text-white'
                    : '!font-semibold'
              }
            />
          </div>
        ) : null}
        <div className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 text-sky-600 shadow-md backdrop-blur-sm">
          <Icon fontSize="medium" />
        </div>
      </Box>
      <CardContent className="!rounded-b-[1.35rem] !p-4 !pt-3">
        <Typography variant="h6" component="h3" className="!font-bold !text-slate-800">
          {title}
        </Typography>
        <Typography variant="body2" className="!mt-0.5 !text-slate-500">
          {meta}
        </Typography>
        <Button
          size="small"
          endIcon={
            actionLabel === 'Shiko kampuset' ? (
              <OpenInNewRounded sx={{ fontSize: 18 }} />
            ) : (
              <MenuBookRounded sx={{ fontSize: 18 }} />
            )
          }
          className="!mt-3 !-ml-2 !rounded-full !font-semibold !text-sky-700 hover:!bg-sky-50"
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const swiperRef = useRef(null)

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col">
      {/* Sipërfaqe e lehtë për përmbajtjen: “faqja e studimit” — e bardhë + sky i butë */}
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-sky-200/45 bg-gradient-to-b from-white via-sky-50/35 to-slate-50 px-2 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] ring-1 ring-sky-100/40 sm:px-4 sm:py-7">
      <section className="relative overflow-hidden rounded-3xl border border-sky-100/80 bg-slate-900 shadow-xl shadow-sky-200/30">
        <IconButton
          type="button"
          aria-label="Slide-i paraprak"
          className={`${heroNavBtnClass} !left-2 sm:!left-3`}
          size="large"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <ChevronLeftRounded />
        </IconButton>
        <IconButton
          type="button"
          aria-label="Slide-i ardhshëm"
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
          {slides.map((slide) => (
            <SwiperSlide key={slide.title}>
              <div className="relative grid min-h-[min(72vw,420px)] sm:min-h-[440px] md:min-h-[500px] md:grid-cols-12">
                <div className="relative md:col-span-7 lg:col-span-8">
                  <img
                    src={heroImg}
                    alt=""
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
                    Meson LMS
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

      {/* Universitetet — i njëjti shablon si kartat e kategorive */}
      <Container maxWidth="lg" className="!px-0 sm:!px-3" sx={{ mt: 6, mb: 1 }}>
        <Box className="mb-8 text-center md:text-left">
          <Typography
            variant="overline"
            className="!font-semibold !tracking-widest !text-sky-600"
          >
            Bashkëpunëtorë akademikë
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            className="!mt-1 !font-bold !text-slate-800"
          >
            Universitetet në rrjetin tonë
          </Typography>
          <Typography
            variant="body1"
            className="!mt-2 !max-w-2xl !text-slate-600 md:mx-0 mx-auto"
          >
            Shembuj nga Kosova dhe Shqipëria — nga UBT në Prishtinë deri te
            universitetet publike më të mëdha. I njëjti stil kartash si më poshtë.
          </Typography>
        </Box>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {universities.map((u) => (
            <SpotlightCard
              key={u.title}
              title={u.title}
              meta={u.meta}
              icon={u.icon}
              chip={u.chip}
              chipColor={u.chipColor}
              actionLabel="Shiko kampuset"
            />
          ))}
        </div>
      </Container>

      {/* Kategoritë — më poshtë universiteteve */}
      <Container maxWidth="lg" className="!px-0 sm:!px-3" sx={{ mt: 10, mb: 0 }}>
        <Box className="mb-8 text-center md:text-left">
          <Typography
            variant="overline"
            className="!font-semibold !tracking-widest !text-sky-600"
          >
            Kategori
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            className="!mt-1 !font-bold !text-slate-800"
          >
            Tema të zgjedhura sipas kategorisë
          </Typography>
          <Typography
            variant="body1"
            className="!mt-2 !max-w-2xl !text-slate-600 md:mx-0 mx-auto"
          >
            Përzgjidhni shtigjin tuaj — nga dizajni dhe programimi deri te gjuhët
            dhe muzika. Kartat e pastra dhe CTA e qartë, njësoj si në temat më
            të mira të LMS.
          </Typography>
        </Box>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => (
            <SpotlightCard
              key={c.title}
              title={c.title}
              meta={c.meta}
              icon={c.icon}
              chip={c.chip}
              chipColor={c.chipColor}
              actionLabel="Shiko kurse"
            />
          ))}
        </div>
      </Container>
      </div>

      {/* Footer deri në fund të viewport-it; pa padding poshtë në App */}
      <div className="relative z-0 mt-12 w-screen max-w-none flex-shrink-0 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] sm:mt-14">
        <Footer />
      </div>
    </div>
  )
}

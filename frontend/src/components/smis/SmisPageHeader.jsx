import { Typography } from '@mui/material'

export default function SmisPageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="mb-5 rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Typography variant="overline" className="!font-black !tracking-[0.2em] !text-sky-700 dark:!text-sky-300">
            {eyebrow}
          </Typography>
          <Typography variant="h4" component="h1" className="!mt-1 !font-black !tracking-tight !text-slate-950 dark:!text-white">
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" className="!mt-2 !max-w-3xl !text-slate-600 dark:!text-slate-400">
              {subtitle}
            </Typography>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
